import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';


export const HOME_ROUTES: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: 'user',
                loadChildren: () => import('./user/user.module').then(m => m.UserModule)
            },

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(HOME_ROUTES)],
    exports: [RouterModule]
})
export class HomeRoutingModule { }
