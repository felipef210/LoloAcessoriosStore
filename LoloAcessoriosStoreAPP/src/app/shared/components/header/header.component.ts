import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterLinkActive  } from '@angular/router';
import { AuthorizedComponent } from "../../security/authorized/authorized.component";
import { SecurityService } from '../../../core/services/security.service';


@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatButtonModule, MatToolbarModule, MatMenuModule, RouterLink, RouterLinkActive, AuthorizedComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  securityService = inject(SecurityService);
}
