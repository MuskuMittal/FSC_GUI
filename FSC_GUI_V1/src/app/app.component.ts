import { Component, inject, ViewChild } from '@angular/core';
import { XlsxHelperService } from './services/xlsx-helper.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';
import { CalenderViewComponent } from './components/calender-view/calender-view.component';
import { SimpleTableComponent } from './components/simple-table/simple-table.component';
import { MatSelectChange } from '@angular/material/select';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild(CalenderViewComponent) calender: CalenderViewComponent | undefined;
  @ViewChild(SimpleTableComponent) table: SimpleTableComponent | undefined;

  showSpinner: boolean;
  tableView: boolean | undefined;
  activityType: Array<string> = [];
  masterApplicationType: Array<string> = [];
  envType: Array<string> = [];
  private _snackBar = inject(MatSnackBar);
  noOfRecords: number = 0;

  filterForm = new FormGroup({
    date: new FormControl(moment()),
    activity_type: new FormControl(''),
    m_app: new FormControl(''),
    env: new FormControl(''),
    view_type: new FormControl(1),
  });

  constructor(private _xlsxHelper: XlsxHelperService) {
    this.showSpinner = true;
    this.loadData();
  }

  loadData(): void {
    this._xlsxHelper.readExcelFileFromPublicFolder().then(() => {
      this.activityType = this._xlsxHelper.getActivityType();
      this.masterApplicationType = this._xlsxHelper.getMasterApplicationType();
      this.envType = this._xlsxHelper.getEnvType();
      this.updateFilter();
      this.showSpinner = false;
    }).catch((reason: any) => {
      this._snackBar.open(reason, 'Error', {
        duration: 1000
      });
      this.showSpinner = false;
    });
  }

  updateFilter() {
    this.noOfRecords = this.calender?.update(this.filterForm.getRawValue()) || 0;
  }

  setView(e: MatSelectChange) {
    this.tableView = e.value === 2;
  }

  setActivityData(data: any) {
    this.table?.setNewData(data);
  }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue: any = this.filterForm.controls['date'].value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.filterForm.controls['date'].setValue(ctrlValue);
    datepicker.close();
    this.updateFilter();
  }

  updateDateControl(date: any) {
    this.filterForm.controls['date'].setValue(moment(date.value));
  }

  uploadNewFile() {
    this._snackBar.open('Coming Soon !', 'Info', {
      duration: 1000
    });
  }

  refreshCache() {
    this._xlsxHelper.refresh();
    this.showSpinner = true;
    this.loadData();
  }

}
