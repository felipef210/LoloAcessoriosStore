import { Routes } from '@angular/router';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AcessoryDetailsComponent } from './pages/acessory-details/acessory-details.component';
import { AcessoryEditComponent } from './pages/acessory-edit/acessory-edit.component';
import { isAdminGuard } from './shared/guards/is-admin.guard';
import { AcessoryListComponent } from './pages/acessory-list/acessory-list.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { isLoggedInGuard } from './shared/guards/is-logged-in.guard';
import { CreateAcessoryComponent } from './pages/create-acessory/acessory-create.component';

export const routes: Routes = [
  {path: '', component: CatalogComponent},

  {path: 'login', component: LoginComponent, canActivate: [isLoggedInGuard]},
  {path: 'signup', component: RegisterComponent, canActivate: [isLoggedInGuard]},

  {path: 'acessory/create', component: CreateAcessoryComponent, canActivate: [isAdminGuard]},
  {path: 'acessory/edit/:id', component: AcessoryEditComponent, canActivate: [isAdminGuard]},
  {path: 'acessory/:id', component: AcessoryDetailsComponent},
  {path: 'acessories', component: AcessoryListComponent, canActivate: [isAdminGuard]},


  {path: 'users', component: UserListComponent, canActivate: [isAdminGuard]},

  {path: '**', redirectTo: ''}
];
