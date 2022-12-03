import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-chatroom-theme-dialog',
  templateUrl: './chatroom-theme-dialog.component.html',
  styleUrls: ['./chatroom-theme-dialog.component.scss']
})
export class ChatroomThemeDialogComponent implements OnInit {

  constructor(public boardTheme: MatDialogRef<ChatroomThemeDialogComponent>) { }

  ngOnInit(): void {
  }

}
