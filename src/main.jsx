import React, { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

const Layout = React.lazy(() => import('./Layout'));
// import { HomePage } from './homePage/HomePage'
const LogInPage = React.lazy(() => import('./logInPage/LogInPage'));
const AttendanceManagementPage = React.lazy(() => import('./attendanceManagementPage/AttendanceManagementPage'));
const AwardsManagementPage = React.lazy(() => import('./awardsManagementPage/AwardsManagementPage'));
const ResultPage = React.lazy(() => import('./resultPage/ResultPage'));
const ResultGenerationPage = React.lazy(() => import('./resultPage/ResultGenerationPage'));
const AdminPage = React.lazy(() => import('./adminPage/AdminPage'));
const UniformInspectionPage = React.lazy(() => import('./uniformInspectionPage/UniformInspectionPage'));
const UniformInspectionResultPage = React.lazy(() => import('./uniformInspectionPage/UniformInspectionResultPage'));
const UniformInspectionForm = React.lazy(() => import('./uniformInspectionPage/UniformInspectionForm'));
const UserManagementPage = React.lazy(() => import('./userManagementPage/UserManagementPage'));
const UserManagementSmallPage = React.lazy(() => import('./userManagementPage/UserManagementSmallPage'));
const ResetPasswordPage = React.lazy(() => import('./userManagementPage/ResetPasswordPage'));
const NotFound = React.lazy(() => import("./general/NotFound"));
const DashboardPage = React.lazy(() => import("./dashboardPage/dashboardPage"));
const ParadeNoticePage = React.lazy(() => import('./attendanceManagementPage/ParadeNoticePage'));
const UserAwards = React.lazy(() => import('./awardsManagementPage/UserAwards'));
const HelpPage = React.lazy(() => import('./helpPage/HelpPage'));
const HomeEditorPage = React.lazy(() => import('./homePage/HomeEditorPage'));
const UniformInspectionUser = React.lazy(() => import('./uniformInspectionPage/UniformInspectionUser'));

createRoot(document.body).render(
	<StrictMode>
		<Router>
			<Suspense fallback={<div>Loading...</div>}>
				<Routes>
					<Route element={<Layout />}>
						{/* Temporarily disable home page since its filled with filler data */}
						{/* <Route path='/' element={<HomePage/>}/> */}
						<Route path='/log_in' element={<LogInPage />} />
						<Route path='/admin' element={<AdminPage />} />
						<Route path='/' element={<LogInPage />} />
						<Route path='/home' element={<DashboardPage />} />
						<Route path='/parade_notice' element={<ParadeNoticePage />} />
						<Route path='/attendance_management' element={<AttendanceManagementPage />} />
						<Route path='/user_awards' element={<UserAwards />} />
						<Route path='/awards' element={<AwardsManagementPage />} />
						<Route path='/generate_result' element={<ResultGenerationPage />} />
						<Route path='/view_result/:id' element={<ResultPage />} />
						<Route path='/uniform_inspection_results' element={<UniformInspectionPage />} />
						<Route path='/view_uniform_inspection/:id' element={<UniformInspectionResultPage />} />
						<Route path='/uniform_inspection_form' element={<UniformInspectionForm />} />
						<Route path='/user_inspections' element={<UniformInspectionUser />} />
						<Route path='/user_management' element={<UserManagementPage />} />
						<Route path='/user_management/:userId' element={<UserManagementSmallPage />} />
						<Route path='/reset_password' element={<ResetPasswordPage />} />
						<Route path='/help' element={<HelpPage />} />
						<Route path='/home_editor' element={<HomeEditorPage />} />
						<Route path="*" element={<NotFound />} />
					</Route>
				</Routes>
			</Suspense>
		</Router>
	</StrictMode>
);