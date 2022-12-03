import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-board-theme-dialog',
  templateUrl: './board-theme-dialog.component.html',
  styleUrls: ['./board-theme-dialog.component.scss']
})
export class BoardThemeDialogComponent implements OnInit {

  constructor(public boardTheme: MatDialogRef<BoardThemeDialogComponent>) { }

  ngOnInit(): void {
  }
  
}
