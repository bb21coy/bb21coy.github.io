import React, { useState, useEffect } from "react";
import styles from './uniformInspectionUser.module.scss'
import Loading from "../general/Loading";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { db } from "../firebase";
import { doc, collection, getDocs, query, orderBy, where, getDoc } from '@firebase/firestore';

function UniformInspectionUser() {
    const [inspectionList, setInspectionList] = useState([]);
    const [selectedInspection, setSelectedInspection] = useState();
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const componentsSnap = await getDocs(query(collection(db, "uniform_categories"), orderBy("order")));
				const components = componentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				setComponents(components);

                const inspections = await getDocs(query(collection(db, "uniform_inspections"), where("boy", "==", doc(db, "users", user.uid)), orderBy("assessed_date", "desc")));
                const inspectionsList = await Promise.all(
                    inspections.docs.map(async d => {
                        const data = d.data();
                        const assessorSnap = await getDoc(data.assessor); // ✅ await works here

                        return {
                            ...data,
                            id: d.id,
                            assessed_date: data.assessed_date.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                            assessor: { id: assessorSnap.id, ...assessorSnap.data() }
                        };
                    })
                );

                setInspectionList(inspectionsList);
                setLoading(false);
            }
        });

        return () => unsub();
    }, []);

    const getInspection = (id) => {
        const obj = inspectionList.find(item => item.id === id);
        setSelectedInspection(obj);
    }

    if (loading) return <Loading />

    return (
        <div className={styles["uniform-inspection-user"]}>
            <h2>My Uniform Inspections Results</h2>

            <div>
                <section>
                    <div>
                        {inspectionList.length > 0 ? inspectionList.map(inspection => (
                            <React.Fragment key={inspection.id}>
                                <input type="radio" name="inspection_selection" id={inspection.id} onChange={() => getInspection(inspection.id)} />
                                <label htmlFor={inspection.id}>
                                    <p title="Inspection Date">{inspection.assessed_date}</p>
                                    <p title="Inspection Score">{inspection.score}</p>
                                </label>
                            </React.Fragment>)) : <p>No inspection results</p>}
                    </div>
                </section>

                <hr />

                <section>
                    {selectedInspection ?
                        <>
                            <div>
                                <p>Date</p>
                                <p>{selectedInspection.assessed_date}</p>
                                <p>Assessor</p>
                                <p>{selectedInspection.assessor?.rank} {selectedInspection.assessor.account_name}</p>
                                <p>Score</p>
                                <p>{selectedInspection.score}</p>
                            </div>

                            {components.map(component => (
                                <div key={component.id}>
                                    <h3>{component.component_name}</h3>
                                    <ul>
                                        {component.components_fields.map((field, index) => (
                                            <li key={`${component.id}-field${index}`}>
                                                <input type="checkbox" disabled id={`${component.id}-field${index}`} checked={selectedInspection.fields.includes(`${component.id}-field${index}`)} className={`${field.field_description.toLowerCase().includes("missing") ? styles["field-missing"] : ""}`} />
                                                <label htmlFor={`${component.id}-field${index}`}>{field.field_description}</label>
                                            </li>
                                        ))}
                                    </ul>
                                    <textarea name={`${component.component_name}-remarks`} value={selectedInspection.remarks[component.id] ?? 'No Remarks Given'} disabled></textarea>
                                </div>
                            ))}
                        </>
                        : <p>Click on an inspection to view results</p>}
                </section>
            </div>
        </div>
    )
}

export default UniformInspectionUser