import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CraftbotComponent } from './craftbot/craftbot.component';


const routes: Routes = [{
  path: '',
  component: CraftbotComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
