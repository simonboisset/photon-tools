import { Component, OnInit } from '@angular/core';
import { isString } from 'util';
import * as moment from 'moment';
@Component({
  selector: 'app-power',
  templateUrl: './power.component.html',
  styleUrls: ['./power.component.scss']
})
export class PowerComponent implements OnInit {

  start = 0;
  end = 1;
  rms = 0;
  mean = 0;
  data: any = [['Time', 'Power']];
  options = {
    hAxis: {
      title: 'Time (h)',
      viewWindow: { min: 0, max: 0 },
    },
    vAxis: {
      title: 'Power (W)',
    },
    title: "Moyenn: W RMS: %",
    titlePosition: "in",
    width: 600,
    height: 400,
    legend: { position: "in" },
    chartArea: { right: 10, top: 10, width: '90%', height: '80%' },
  };
  constructor() { }
  ngOnInit() { }
  fileChange(file: File) {
    let reader:any = new FileReader();
    reader.onload = () => {
      if (isString(reader.result)) {
        let data: any = reader.result.split('\n');
        data.splice(0, 17);
        data.splice(data.length - 1, 1);
        data = data.map((row: string) => {
          let newRow: any;
          newRow = row
          while (newRow[0] === " ") {
            newRow = newRow.slice(1);
          }
          newRow = newRow.slice(0, -3);
          newRow = newRow.split("	  ");
          // newRow = Number(newRow);
          newRow = newRow.map((text: string) => Number(text));
          newRow[0] = newRow[0] / 3600;
          return newRow;
        });
        this.options.hAxis.viewWindow.min = data[0][0];
        this.options.hAxis.viewWindow.max = Math.round((data[data.length - 1][0]) * 10) / 10 - 5;

        // calcul moyenne
        let mean = 0;
        for (let i = 0; i < data.length; i++) {
          mean = mean + data[i][1];
        }
        mean = mean / data.length;
        // calcul écart-type
        let ecartType = 0;
        for (let i = 0; i < data.length; i++) {
          ecartType = ecartType + Math.pow(data[i][1] - mean, 2);
        }
        ecartType = Math.sqrt(ecartType / data.length);
        let rms = (ecartType / mean) * 100;
        mean = Math.round(mean * 100) / 100;
        rms = Math.round(rms * 100) / 100;
        data.splice(0, 0, ['Time', 'Power']);
        this.data = data;
        this.options.title = `Mean: ${mean}W RMS: ${rms}%`;
      }
    }
    reader.readAsText(file);
  }
  fileTempChange = (file: File) => {
    let reader:any = new FileReader();
    reader.onload = () => {
      if (isString(reader.result)) {
        let data: any = reader.result;
        data = data.split('\n');
        data.splice(0, 1);
        let t0:moment.Moment;
        data = data.map((row: string,i:number,array:[]) => {
          let newRow: any = row.slice(0, -2);
          newRow = row.split(",");
          newRow[1] = moment(newRow[1], "DD-MM-YYYY HH:mm:ss");
          if (i===0) {
            newRow[0] = 0
            t0= newRow[1];
          }
          else{
            newRow[0] = moment.duration(newRow[1].diff(t0)).as("second");
          }
          newRow = newRow.map((text: string) => Number(text));
          return [newRow[0],newRow[2],newRow[3]];
        });
        let ii = 0;
        data = this.data.map((row: any[], i: number) => {
          if (i === 0) {
            return ['Time', 'Power', 'Temperature', 'Humidity']
          }
          else {
            if (data[ii][0] / 3600 < row[0] && data[ii + 1][0] >= row[0]) {
              ii++
            }
            return [row[0], row[1], data[ii][1], data[ii][2]]
          }
        });
        this.data = data;
      }
    }
    reader.readAsText(file);

  }
  rangeChange() {
    // this.data = this.data;
  }
}
