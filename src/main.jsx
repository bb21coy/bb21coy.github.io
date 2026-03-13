import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from "./general/UserContext";

import Layout from './general/Layout';
import Loading from './general/Loading';
import ErrorBoundary from "./general/ErrorBoundary";
import UserPermissions from './general/UserPermissions';
import NotFound from "./general/NotFound";

const LogInPage = lazy(() => import('./logInPage/LogInPage'));
const AttendanceManagementPage = lazy(() => import('./attendanceManagementPage/AttendanceManagementPage'));
const ResetPasswordPage = lazy(() => import('./userManagementPage/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./dashboardPage/dashboardPage'));
const ParadeNoticePage = lazy(() => import('./attendanceManagementPage/ParadeNoticePage'));
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

								<Route path='/user_attendance' element={
									<UserPermissions allowedAccountTypes={['Admin', 'Officer', 'Primer', 'Boy']}>
										<UserAttendance />
									</UserPermissions>
								} />

								<Route path='/manage_login' element={<ResetPasswordPage />} />
								<Route path="*" element={<NotFound />} />
							</Route>
						</Routes>
					</ UserProvider>
				</Suspense>
			</Router>
		</ErrorBoundary>
	</StrictMode>
);
