import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { read, utils } from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class XlsxHelperService {
  acceptedHeades = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N';
  cachedData: any;
  private _snackBar = inject(MatSnackBar);
  activityTypeColumnKey:string = '';
  startDateColumnKey:string = '';
  endColumnKey:string = '';
  changeColumnKey:string = 'A';
  constructor() { }


  async readExcelFileFromPublicFolder(): Promise<void> {
    try {
      const FSC_DATA = localStorage.getItem('FSC_DATA');
      if (FSC_DATA) {
        this.cachedData = JSON.parse(FSC_DATA);
        return new Promise<void>((resolve, reject) => {
          resolve();
        })
      }
      const f = await fetch("/Downtime calendar.xlsx");
      const ab = await f.arrayBuffer();
      const wb = read(ab, { sheets: 'FSC Data' });
      const ws = wb.Sheets['FSC Data'];
      this.cachedData = utils.sheet_to_json<any>(ws, { blankrows: false, defval: null, skipHidden: true, header: this.acceptedHeades.split(','), raw: false, dateNF: 'DD-MM-YYYY' });
      localStorage.setItem('FSC_DATA', JSON.stringify(this.cachedData));
    } catch (e) {
      this._snackBar.open(JSON.stringify(e));
    }
  } 


  getYears(): Array<string | number> {
    const uniqueyears: Array<string | number> = [];
    let keyOfStartDateColumn: string;
    let keyOfEndDateColumn: string;

    Object.keys(this.cachedData[0]).forEach((key: string) => {
      if (this.cachedData[0][key] === 'SCHEDSTART') {
        this.startDateColumnKey = key;
        keyOfStartDateColumn = key;
      }
      if (this.cachedData[0][key] === 'SCHEDEND') {
        this.endColumnKey = key;
        keyOfEndDateColumn = key;
      }
    })

    this.cachedData.forEach((row: any, index: number) => {
      if (index > 0 && row[keyOfStartDateColumn]) {
        const year = new Date(row[keyOfStartDateColumn]).getFullYear();
        year && uniqueyears.push(year);
      }
      if (index > 0 && row[keyOfEndDateColumn]) {
        const year = new Date(row[keyOfEndDateColumn]).getFullYear();
        year && uniqueyears.push(year);
      }
    })

    return Array.from(new Set(uniqueyears));
  }

  getActivityType(): Array<string> {
    const uniqueATypes: Array<string> = [];
    let keyOfActivityTypeColumn: string;
    Object.keys(this.cachedData[0]).forEach((key: string) => {
      if (this.cachedData[0][key] === 'Activity Type') {
        this.activityTypeColumnKey = key;
        keyOfActivityTypeColumn = key;
      }
    })

    this.cachedData.forEach((row: any, index: number) => {
      if (index > 0 && row[keyOfActivityTypeColumn]) {
        const activity = row[keyOfActivityTypeColumn]
        activity && uniqueATypes.push(activity);
      }
    })

    return Array.from(new Set(uniqueATypes));
  }

  filterActivityData(filterData: any) {
    const activityFilteredData = this.cachedData.filter((row:any)=> row[this.activityTypeColumnKey] === filterData.activity_type);
    return activityFilteredData;
  }

}
