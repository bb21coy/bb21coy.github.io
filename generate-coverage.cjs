const fs = require('fs').promises;
const path = require('path');
const v8toIstanbul = require('v8-to-istanbul');
const reports = require('istanbul-reports');
const { createContext } = require('istanbul-lib-report');
const { createCoverageMap } = require('istanbul-lib-coverage');

const coverageDir = path.join(process.cwd(), 'coverage/temp');
const outputDir = path.join(process.cwd(), 'coverage/frontend');

async function convertCoverage() {
  try {
    await fs.access(coverageDir);
  } catch {
    console.log('❌ No coverage data found.');
    return;
  }

  const coverageMap = createCoverageMap();
  const files = await fs.readdir(coverageDir);

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const raw = await fs.readFile(path.join(coverageDir, file), 'utf-8');

    // Split possible concatenated JSON arrays
    const jsonChunks = raw
      .trim()
      .replace(/\]\s*\[/g, '],[',) // merge ][ into ,
      .replace(/^\s*\[/, '[')
      .replace(/\]\s*$/, ']');

    let v8Coverage;
    try {
      v8Coverage = JSON.parse(jsonChunks);
    } catch (e) {
      console.warn(`⚠ Skipping invalid JSON file: ${file}`);
      continue;
    }

    for (const entry of v8Coverage) {
      if (!entry.url || !entry.source) continue;

      let pathname;
      try {
        pathname = new URL(entry.url).pathname;
      } catch {
        continue;
      }

      // 🔒 FILTER OUT NON-APP / VIRTUAL FILES
      if (
        pathname.startsWith('/@') ||
        pathname.startsWith('/node_modules') ||
        pathname.includes('.vite') ||
        pathname.includes('firebase') ||
        pathname.includes('?') ||
        pathname.startsWith('about:') ||
        pathname.startsWith('googleapis') ||
        pathname.startsWith('translate') ||
        pathname.includes('srcdoc') ||
        pathname.includes('mammoth')
      ) {
        continue;
      }

      // ✅ ONLY COVER YOUR SOURCE FILES
      if (!pathname.startsWith('/src/')) continue;

      const fullPath = path.normalize(
        path.join(process.cwd(), pathname.slice(1))
      );

      try {
        const converter = v8toIstanbul(fullPath, 0, {
          source: entry.source,
        });

        await converter.load();
        converter.applyCoverage(entry.functions);
        coverageMap.merge(converter.toIstanbul());
      } catch (err) {
        console.warn(`⚠ Skipping ${pathname}: ${err.message}`);
      }
    }

  }

  if (!Object.keys(coverageMap.data).length) {
    console.log('No coverage data was converted.');
    return;
  }

  await fs.mkdir(outputDir, { recursive: true });
  const context = createContext({ dir: outputDir, coverageMap });

  ['html', 'lcovonly'].forEach(type =>
    reports.create(type).execute(context)
  );

  const summary = coverageMap.getCoverageSummary().data;
  const thresholds = {
    lines: 95,
    statements: 95,
    functions: 95,
    branches: 95
  };

  let belowThreshold = [];
  for (const [metric, threshold] of Object.entries(thresholds)) {
    const covered = summary[metric].pct;
    if (covered < threshold) {
      belowThreshold.push(`${metric}: ${covered}% (below ${threshold}%)`);
    }
  }

  if (belowThreshold.length > 0) {
    console.error('\nX Coverage threshold NOT met:');
    belowThreshold.forEach(msg => console.error(` - ${msg}`));
    process.exitCode = 1;
  } else {
    console.log('\n✓ All coverage thresholds met.');
  }

  console.log(`Coverage report generated`);
}

convertCoverage();
