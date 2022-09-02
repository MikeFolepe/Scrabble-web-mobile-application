import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Level } from '@common/level';

@Component({
    selector: 'app-level-field',
    templateUrl: './level-field.component.html',
    styleUrls: ['./level-field.component.scss'],
})
export class LevelFieldComponent implements OnInit {
    @Input() parentForm: FormGroup;
    difficultySelectionList: string[] = [Level.Beginner, Level.Expert];

    ngOnInit(): void {
        this.parentForm.controls.levelInput.setValidators([Validators.required]);
    }
}
