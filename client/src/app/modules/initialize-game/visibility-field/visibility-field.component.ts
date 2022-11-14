import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-visibility-field',
    templateUrl: './visibility-field.component.html',
    styleUrls: ['./visibility-field.component.scss'],
})
export class VisibilityFieldComponent implements OnInit {
    @Input() parentForm: FormGroup;
    visibilitySelectionList: string[] = ['Publique', 'Privée'];

    ngOnInit(): void {
        this.parentForm.controls.levelInput.setValidators([Validators.required]);
    }
}
