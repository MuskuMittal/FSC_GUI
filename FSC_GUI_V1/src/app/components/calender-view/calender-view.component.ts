import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { DayPilot, DayPilotMonthComponent } from '@daypilot/daypilot-lite-angular';
import { XlsxHelperService } from '../../services/xlsx-helper.service';
import moment from 'moment';

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
    eventDeleteHandling: "Disabled",
    eventMoveHandling: "Disabled",
    eventResizeHandling: "Disabled",
    eventRightClickHandling: "Disabled",
    onEventClick: (args: any) => {
      const form = [
        {
          cssClass: 'custom-class-table',
          html: `
          <table>
                <tr>
                  <th>Change Number</th>
                  <th>Summary</th>
                  <th>Status</th>
                  <th>Hostname</th>
                  <th>Scheduled Start</th>
                  <th>Scheduled Finish</th>
                  <th>Owner Group</th>
                  <th>Owner Name</th>
                  <th>Master Application</th>
                  <th>Environment</th>
                  <th>Master Instance</th>
                  <th>Danone PO</th>
                  <th>Danone SM</th>
                  <th>Kyndryl PO</th>
                  <th>Kyndryl SM</th>
                  <th>Activity Type</th>
                  <th>Month</th>
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
                  <td>${args.e.data.rowData.O}</td>
                  <td>${args.e.data.rowData.P}</td>
                  <td>${args.e.data.rowData.Q}</td>
                </tr>
          </table>
          ` }
      ];
      DayPilot.Modal.form(form, {}, { cancelText: '' });
    },
    onBeforeCellRender: (args: any) => {
      if (args.cell.start.getDatePart().getTime() === new DayPilot.Date().getDatePart().getTime()) {
        args.cell.properties.backColor = "#b8edb8";
      }
    }
  }

  events: any = [];

  update(filterData: any): number {
    if(filterData.date) {
      const day = DayPilot.Date.now().firstDayOfMonth().getDay();
      this.calendar.control.startDate = DayPilot.Date.fromYearMonthDay(filterData.date.year(), filterData.date.month(), day);
    }
    const filteredData = this._xlsxHelper.filterDropDownData(filterData);
    this.activityData.emit(filteredData);
    this.prepareEvents(filteredData);
    return filteredData.length;
  }

  prepareEvents(filteredData: any) {
    const newEvents: any = [];
    const labelColorMap: any = {};
    filteredData.forEach((row: any, index: number) => {
      if(index > 0) {
        let startDate: any = moment(row[this._xlsxHelper.startDateColumnKey], this._xlsxHelper._excelConfig.date_format);
        startDate = DayPilot.Date.fromYearMonthDay(startDate.year(), startDate.month() + 1, startDate.date());
  
        let endDate: any = moment(row[this._xlsxHelper.endColumnKey], this._xlsxHelper._excelConfig.date_format);
        endDate = DayPilot.Date.fromYearMonthDay(endDate.year(), endDate.month() + 1, endDate.date());

        const label = `${row[this._xlsxHelper.activityTypeColumnKey]} - ${row[this._xlsxHelper.hostNameKey]}`;
        labelColorMap[label] = labelColorMap[label] || this.getRandomColor(filteredData.length / 2, index + 1);
        if (startDate.value.indexOf('NaN') === -1 && endDate.value.indexOf('NaN') === -1)
          newEvents.push({
            start: startDate,
            end: endDate,
            id: index + 1,
            text: label,
            rowData: row,
            barColor: labelColorMap[label]
          })
      }
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

  getRandomColor(numOfSteps: number, step: number) {
    let r: any, g: any, b: any;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch (i % 6) {
      case 0: r = 1; g = f; b = 0; break;
      case 1: r = q; g = 1; b = 0; break;
      case 2: r = 0; g = 1; b = f; break;
      case 3: r = 0; g = q; b = 1; break;
      case 4: r = f; g = 0; b = 1; break;
      case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
  }

}
