import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FormComponent } from "../../shared/components/form/form.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";

@Component({
  selector: 'app-register',
  imports: [HeaderComponent, FormComponent, FooterComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

}
