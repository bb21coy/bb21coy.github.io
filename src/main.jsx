import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from "./general/UserContext";

import Layout from './general/Layout';
import Loading from './general/Loading';
import ErrorBoundary from "./general/ErrorBoundary";
import UserPermissions from './general/UserPermissions';
import NotFound from "./general/NotFound";

// const HomePage = lazy(() => import('./homePage/HomePage'));
const CalendarPage = lazy(() => import('./migration/Calendar'));

const LogInPage = lazy(() => import('./logInPage/LogInPage'));
const AttendanceManagementPage = lazy(() => import('./attendanceManagementPage/AttendanceManagementPage'));
const AwardsManagementPage = lazy(() => import('./migration/AwardsManagementPage'));
const ResultGenerationPage = lazy(() => import('./migration/ResultGenerationPage'));
const UniformInspectionPage = lazy(() => import('./migration/UniformInspectionSummary'));
const UserManagementPage = lazy(() => import('./migration/UserManagementPage'));
const ResetPasswordPage = lazy(() => import('./userManagementPage/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./dashboardPage/dashboardPage'));
const ParadeNoticePage = lazy(() => import('./attendanceManagementPage/ParadeNoticePage'));
const UserAwards = lazy(() => import('./migration/UserAwards'));
const UniformInspectionUser = lazy(() => import('./migration/UniformInspectionUser'));
const ResourcePage = lazy(() => import('./migration/ResourcePage'));
const UserAttendance = lazy(() => import('./attendanceManagementPage/UserAttendance'));

createRoot(document.body).render(
	<StrictMode>
		<ErrorBoundary>
			<Router>
				<Suspense fallback={<Loading />}>
					<UserProvider>
						<Routes>
							<Route path='/login' element={<LogInPage />} />
							<Route path='/' element={<LogInPage />} />
							<Route path='/calendar' element={<CalendarPage />} />
							<Route element={<Layout />}>
								<Route path='/parade_notice' element={<ParadeNoticePage />} />
								
								<Route path='/home' element={
									<UserPermissions allowedAccountTypes={['Admin', 'Officer', 'Primer', 'Boy']}>
										<DashboardPage />
									</UserPermissions>
								} />

								<Route path='/attendance_management' element={
									<UserPermissions allowedAccountTypes={['Admin', 'Officer', 'Primer']} apptAllowed={true}>
										<AttendanceManagementPage />
									</UserPermissions>
								} />

								<Route path='/user_awards' element={
									<UserPermissions allowedAccountTypes={['Admin', 'Boy']}>
										<UserAwards />
									</UserPermissions>
								} />

								<Route path='/user_attendance' element={
									<UserPermissions allowedAccountTypes={['Admin', 'Officer', 'Primer', 'Boy']}>
										<UserAttendance />
									</UserPermissions>
								} />

								<Route path='/award_management' element={
									<UserPermissions allowedAccountTypes={['Admin', 'Officer', 'Primer']} apptAllowed={true}>
										<AwardsManagementPage />
									</UserPermissions>
								} />

								<Route path='/generate_result' element={
									<UserPermissions allowedAccountTypes={['Admin', 'Officer', 'Primer']} apptAllowed={true}>
										<ResultGenerationPage />
									</UserPermissions>
								} />

								<Route path='/uniform_inspection' element={
									<UserPermissions allowedAccountTypes={['Admin', 'Officer', 'Primer']}>
										<UniformInspectionPage />
									</UserPermissions>
								} />

								<Route path='/user_inspections' element={
									<UserPermissions allowedAccountTypes={['Admin', 'Boy']}>
										<UniformInspectionUser />
									</UserPermissions>
								} />

								<Route path='/user_management' element={
									<UserPermissions allowedAccountTypes={['Admin', 'Officer', 'Primer']} apptAllowed={true}>
										<UserManagementPage />
									</UserPermissions>
								} />

								<Route path='/manage_login' element={<ResetPasswordPage />} />

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
