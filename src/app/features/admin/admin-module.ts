import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';

@NgModule({
  declarations: [AdminDashboard],
  imports: [CommonModule, AdminRoutingModule],
})
export class AdminModule {}
