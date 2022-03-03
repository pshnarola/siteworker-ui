import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGaurdClientGuard } from './shared/auth-gaurd-client.guard';
import { AuthGuard } from './shared/auth.guard';
import { AuthGuardAdmin } from './shared/auth.guardAdmin';
import { ErrorComponent } from './shared/error/error.component';
import { SubcontractorGuard } from './shared/subcontractor.guard';
import { WorkerGuard } from './shared/worker.guard';


const routes: Routes = [
  { path: "", pathMatch: 'full', redirectTo: "login", data: { title: "Login" } },
  { path: 'login', loadChildren: () => import('./module/login/login.module').then(l => l.LoginModule) },
  // tslint:disable-next-line: max-line-length
  { path: 'notification', loadChildren: () => import('./module/notification-and-message/notification-and-message.module').then(m => m.NotificationAndMessageModule) },
  {
    path: 'admin', loadChildren: () => import('./module/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuardAdmin]
  },
  {
    path: 'preview', loadChildren: () => import('./module/preview/preview.module').then(m => m.PreviewModule)
  },
  {
    path: 'client', loadChildren: () => import('./module/client/client.module').then(m => m.ClientModule),
    canActivate: [AuthGaurdClientGuard]
  },
  {
    path: 'subcontractor', loadChildren: () => import('./module/subcontractor/subcontractor.module').then(m => m.SubcontractorModule),
    canActivate: [SubcontractorGuard]
  },
  {
    path: 'worker', loadChildren: () => import('./module/worker/worker.module').then(m => m.WorkerModule),
    canActivate: [WorkerGuard]
  },
  { path: 'signup', loadChildren: () => import('./module/signup/signup.module').then(m => m.SignupModule) },
  // { path: '**', redirectTo: '/login' }
  { path: '404', component: ErrorComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
