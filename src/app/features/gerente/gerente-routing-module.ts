import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GerenteDashboard } from './pages/gerente-dashboard/gerente-dashboard';

const routes: Routes = [
  {
    path: '',
    component: GerenteDashboard,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GerenteRoutingModule {}
