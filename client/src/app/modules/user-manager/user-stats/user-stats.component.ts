/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-user-stats',
    templateUrl: './user-stats.component.html',
    styleUrls: ['./user-stats.component.scss'],
})
export class UserStatsComponent implements OnInit {
    constructor(public userService: UserService, public authService: AuthService) {}

    ngOnInit(): void {
        this.userService.getUserStats(this.authService.currentUser._id);
    }
}
