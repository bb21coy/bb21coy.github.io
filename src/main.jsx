import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from "./general/UserContext";

import Layout from './general/Layout';
import Loading from './general/Loading';
import ErrorBoundary from "./general/ErrorBoundary";

// const HomePage = lazy(() => import('./homePage/HomePage'));

const LogInPage = lazy(() => import('./logInPage/LogInPage'));
const AttendanceManagementPage = lazy(() => import('./attendanceManagementPage/AttendanceManagementPage'));
const AwardsManagementPage = lazy(() => import('./awardsManagementPage/AwardsManagementPage'));
const ResultPage = lazy(() => import('./resultPage/ResultPage'));
const ResultGenerationPage = lazy(() => import('./resultPage/ResultGenerationPage'));
const UniformInspectionPage = lazy(() => import('./uniformInspectionPage/UniformInspectionSummary'));
const UniformInspectionResultPage = lazy(() => import('./uniformInspectionPage/UniformInspectionResultPage'));
const UniformInspectionForm = lazy(() => import('./uniformInspectionPage/UniformInspectionForm'));
const UserManagementPage = lazy(() => import('./userManagementPage/UserManagementPage'));
const UserManagementSmallPage = lazy(() => import('./userManagementPage/UserManagementSmallPage'));
const ResetPasswordPage = lazy(() => import('./userManagementPage/ResetPasswordPage'));
const NotFound = lazy(() => import('./general/NotFound'));
const DashboardPage = lazy(() => import('./dashboardPage/dashboardPage'));
const ParadeNoticePage = lazy(() => import('./attendanceManagementPage/ParadeNoticePage'));
const UserAwards = lazy(() => import('./awardsManagementPage/UserAwards'));
const HelpPage = lazy(() => import('./helpPage/HelpPage'));
const HomeEditorPage = lazy(() => import('./homePage/HomeEditorPage'));
const UniformInspectionUser = lazy(() => import('./uniformInspectionPage/UniformInspectionUser'));
const ResourcePage = lazy(() => import('./resourcePage/ResourcePage'));

createRoot(document.body).render(
	<StrictMode>
		<ErrorBoundary>
			<Router>
				<Suspense fallback={<Loading />}>
					<UserProvider>
						<Routes>
							<Route element={<Layout />}>
								{/* Temporarily disable home page since its filled with filler data */}
								{/* <Route path='/' element={<HomePage/>}/> */}
								<Route path='/login' element={<LogInPage />} />
								<Route path='/' element={<LogInPage />} />
								<Route path='/home' element={<DashboardPage />} />
								<Route path='/parade_notice' element={<ParadeNoticePage />} />
								<Route path='/attendance_management' element={<AttendanceManagementPage />} />
								<Route path='/user_awards' element={<UserAwards />} />
								<Route path='/awards' element={<AwardsManagementPage />} />
								<Route path='/generate_result' element={<ResultGenerationPage />} />
								<Route path='/view_result/:id' element={<ResultPage />} />
								<Route path='/uniform_inspection' element={<UniformInspectionPage />} />
								<Route path='/view_uniform_inspection/:id' element={<UniformInspectionResultPage />} />
								<Route path='/uniform_inspection_form' element={<UniformInspectionForm />} />
								<Route path='/user_inspections' element={<UniformInspectionUser />} />
								<Route path='/user_management' element={<UserManagementPage />} />
								<Route path='/user_management/:userId' element={<UserManagementSmallPage />} />
								<Route path='/manage_login' element={<ResetPasswordPage />} />
								<Route path='/help' element={<HelpPage />} />
								<Route path='/home_editor' element={<HomeEditorPage />} />
								<Route path='/resources' element={<ResourcePage />} />
								<Route path="*" element={<NotFound />} />
							</Route>
						</Routes>
					</ UserProvider>
				</Suspense>
			</Router>
		</ErrorBoundary>
	</StrictMode>
);

let refreshInProgress = false;
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js").catch(console.error);
	});

	navigator.serviceWorker.addEventListener("message", async (event) => {
		if (event.data?.type === "SW_FETCH_FAILED" && !refreshInProgress) {
			refreshInProgress = true; // prevent duplicate alerts
			alert("The site has been updated. Refreshing to get the latest version...");

			// Unregister the service worker
			const regs = await navigator.serviceWorker.getRegistrations();
			for (const reg of regs) {
				await reg.unregister();
			}

			// Clear caches
			if (window.caches) {
				const keys = await caches.keys();
				await Promise.all(keys.map((key) => caches.delete(key)));
			}

			// Force reload bypassing cache
			location.reload(true);
		}

		if (event.data?.type === "SW_UPDATE_AVAILABLE" && !refreshInProgress) {
			refreshInProgress = true;
			alert("The site has been updated. Refreshing to get the latest version...");
			// unregister + clear caches + reload
		}
	});
}