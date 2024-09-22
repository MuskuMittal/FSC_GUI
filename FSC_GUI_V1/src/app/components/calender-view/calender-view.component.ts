import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { DayPilot, DayPilotMonthComponent } from '@daypilot/daypilot-lite-angular';
import { XlsxHelperService } from '../../services/xlsx-helper.service';

@Component({
  selector: 'app-calender-view',
  templateUrl: './calender-view.component.html',
  styleUrl: './calender-view.component.scss'
})
export class CalenderViewComponent {
  @ViewChild("calendar")
  calendar!: DayPilotMonthComponent;

  @Output() updateDate: EventEmitter<any> = new EventEmitter();
  @Output() activityData: EventEmitter<any> = new EventEmitter();

  constructor(private _xlsxHelper: XlsxHelperService) {

  }

  config: any = {
    startDate: DayPilot.Date.today(),
    onEventClick: (args: any) => {
      const form = [
        {
          cssClass: 'custom-class-table',
          html: `
          <table>
                <tr>
                  <th>Change</th>
                  <th>Summary</th>
                  <th>OWNERGROUP</th>
                  <th>OWNER</th>
                  <th>STATUS</th>
                  <th>SCHEDSTART</th>
                  <th>SCHEDEND</th>
                  <th>CUSTOMER</th>
                  <th>CINUM</th>
                  <th>Master Application</th>
                  <th>Kyndryl SM</th>
                  <th>Danone PO</th>
                  <th>Danone SM</th>
                  <th>Activity Type</th>
                </tr>
                <tr>
                  <td>${args.e.data.rowData.A}</td>
                  <td>${args.e.data.rowData.B}</td>
                  <td>${args.e.data.rowData.C}</td>
                  <td>${args.e.data.rowData.D}</td>
                  <td>${args.e.data.rowData.E}</td>
                  <td>${args.e.data.rowData.F}</td>
                  <td>${args.e.data.rowData.G}</td>
                  <td>${args.e.data.rowData.H}</td>
                  <td>${args.e.data.rowData.I}</td>
                  <td>${args.e.data.rowData.J}</td>
                  <td>${args.e.data.rowData.K}</td>
                  <td>${args.e.data.rowData.L}</td>
                  <td>${args.e.data.rowData.M}</td>
                  <td>${args.e.data.rowData.N}</td>
                </tr>
          </table>
          ` }
      ];
      DayPilot.Modal.form(form, {}, {cancelText: ''});
    },
    onBeforeCellRender: (args: any) => {
      if (args.cell.start.getDatePart().getTime() === new DayPilot.Date().getDatePart().getTime()) {
        args.cell.properties.backColor = "#b8edb8";
      }
    }
  }

  events: any = [];

  setNewMonth(filterData: any): void {
    const year = filterData.year || DayPilot.Date.now().getYear();
    const month = filterData.month || DayPilot.Date.now().getYear();
    const day = DayPilot.Date.now().firstDayOfMonth().getDay();
    this.calendar.control.startDate = DayPilot.Date.fromYearMonthDay(year, month, day);
    this.calendar.control.update();
  }

  setNewYear(filterData: any): void {
    const year = filterData.year || DayPilot.Date.now().getYear();
    const month = filterData.month || DayPilot.Date.now().getYear();
    const day = DayPilot.Date.now().firstDayOfMonth().getDay();
    this.calendar.control.startDate = DayPilot.Date.fromYearMonthDay(year, month, day);
    this.calendar.control.update();
  }

  setNewActivity(filterData: any): void {
    const filteredData = this._xlsxHelper.filterActivityData(filterData);
    this.activityData.emit(filteredData);
    this.prepareEvents(filteredData);
  }

  prepareEvents(filteredData: any) {
    const newEvents: any = [];
    filteredData.forEach((row: any, index: number) => {
      let startDate: any = new Date(row[this._xlsxHelper.startDateColumnKey]);
      startDate = DayPilot.Date.fromYearMonthDay(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDay());
      let endDate: any = new Date(row[this._xlsxHelper.startDateColumnKey]);
      endDate = DayPilot.Date.fromYearMonthDay(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDay());
      newEvents.push({
        start: startDate,
        end: endDate,
        id: index + 1,
        text: row[this._xlsxHelper.changeColumnKey],
        rowData: row
      })
    });
    this.calendar.events = newEvents;
    this.calendar.control.update();
  }

  nextMonth() {
    let date: any = this.calendar.control.startDate;
    date = date.addMonths(1);
    this.calendar.control.startDate = date;
    this.calendar.control.update();
    this.updateMonthYear();
  }

  previousMonth() {
    let date: any = this.calendar.control.startDate;
    date = date.addMonths(-1);
    this.calendar.control.startDate = date;
    this.calendar.control.update();
    this.updateMonthYear();
  }

  updateMonthYear() {
    this.updateDate.emit(this.calendar.control.startDate);
  }

}
