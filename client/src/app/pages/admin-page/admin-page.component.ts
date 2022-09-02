import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { AdministratorService } from '@app/services/administrator.service';
import { Dictionary } from '@common/dictionary';
import { EditDictionaryDialogComponent } from './edit-dictionary-dialog/edit-dictionary-dialog.component';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    @ViewChild(MatAccordion) accordion: MatAccordion;
    @ViewChild('fileInput') fileInput: ElementRef;
    isResetConfirmation: boolean;

    constructor(public adminService: AdministratorService, public dialog: MatDialog) {
        this.isResetConfirmation = false;
    }

    ngOnInit() {
        this.adminService.initializeAiPlayers();
        this.adminService.initializeDictionaries();
    }

    onSubmitDictionary(): void {
        this.adminService.onSubmit();
        this.fileInput.nativeElement.value = '';
    }

    cancelReset(): void {
        if (this.isResetConfirmation) this.isResetConfirmation = false;
    }

    editDictionary(dictionary: Dictionary): void {
        if (!this.adminService.isDictionaryDeletable(dictionary)) return;
        this.dialog
            .open(EditDictionaryDialogComponent, {
                disableClose: true,
                data: {
                    title: dictionary.title,
                    description: dictionary.description,
                },
            })
            .afterClosed()
            .subscribe((response) => {
                if (!response) return;
                if (!response.title || !response.description) return;
                this.adminService.updateDictionary(dictionary, response);
            });
    }
}
