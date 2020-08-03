import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CraftbotComponent } from './craftbot/craftbot.component';
import { HttpClientModule } from '@angular/common/http';
import { FilterByPipe } from './filter-by.pipe';

@NgModule({
  declarations: [
    AppComponent,
    CraftbotComponent,
    FilterByPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
