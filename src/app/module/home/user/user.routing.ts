import { UserComponent } from './user.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

export const USER_ROUTES: Routes = [
    {
        path: '', component: UserComponent, data: { title: 'User' },
        // children: [ 
        //   { path: '', redirectTo: 'admin', pathMatch: 'full' },

        // ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(USER_ROUTES)],
    exports: [RouterModule]
})

export class UserRoutingModule { }

