import { Component, inject, ViewChild } from '@angular/core';
import { XlsxHelperService } from './services/xlsx-helper.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';
import { CalenderViewComponent } from './components/calender-view/calender-view.component';
import { SimpleTableComponent } from './components/simple-table/simple-table.component';
import { MatSelectChange } from '@angular/material/select';

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
  availableYears: Array<string | number> = [];
  activityType: Array<string> = [];
  private _snackBar = inject(MatSnackBar);
  filterForm = new FormGroup({
    year: new FormControl(''),
    month: new FormControl(''),
    activity_type: new FormControl(''),
    view_type: new FormControl(1),
  });

  constructor(private _xlsxHelper: XlsxHelperService) {
    this.showSpinner = true;
    this.loadData();
  }

  loadData(): void {
    this._xlsxHelper.readExcelFileFromPublicFolder().then(() => {
      this.showSpinner = false;
      this.availableYears = this._xlsxHelper.getYears();
      this.activityType = this._xlsxHelper.getActivityType();
    }).catch((reason: any) => {
      this._snackBar.open(reason);
      this.showSpinner = false;
    });
  }

  setMonth() {
    this.calender?.setNewMonth(this.filterForm.getRawValue());
  }

  setYear() {
    this.calender?.setNewYear(this.filterForm.getRawValue());
  }

  setActivity() {
    this.calender?.setNewActivity(this.filterForm.getRawValue());
  }

  setView(e : MatSelectChange) {
    this.tableView = e.value === 2;
  }

  updateDateDropDown(date: any) {
    this.filterForm.controls['year'].setValue(date.getYear());
    this.filterForm.controls['month'].setValue(JSON.stringify(date.getMonth() + 1));
  }

  setActivityData(data: any) {
    this.table?.setNewData(data)
  }

}
