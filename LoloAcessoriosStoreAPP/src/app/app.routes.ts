import { Routes } from '@angular/router';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AcessoryDetailsComponent } from './pages/acessory-details/acessory-details.component';

export const routes: Routes = [
  {path: '', component: CatalogComponent},

  {path: 'login', component: LoginComponent},
  {path: 'signup', component: RegisterComponent},
  {path: 'acessory/:id', component: AcessoryDetailsComponent},

  {path: '**', redirectTo: ''}
];
