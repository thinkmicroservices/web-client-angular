import { Component, OnInit } from '@angular/core';
import { TreeNodeImpl } from '../../../services/admin/treenode.service'

import { TreeNode } from 'primeng/api';
import { LoggingService } from '../../../services/logging/logging.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { TreeNodeService, NamedServiceInstance, ServiceInstance } from '../../../services/admin/treenode.service'
import { AdminService } from '../../../services/admin/admin.service';
@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  providers: [MessageService]
})
export class ServicesComponent implements OnInit {

  applicationServiceTree: TreeNode[] = [];
  selectedServiceInstance: TreeNodeImpl;
  displayInstanceDialog: boolean = false;
  toggleServiceTreeState: boolean = false;
  serviceTreeLayout: string = "horizontal";

  constructor(private logger: LoggingService,
    private messageService: MessageService,
    private adminService: AdminService,

    private treeNodeService: TreeNodeService) { }

  ngOnInit() {
    this.treeNodeService.getServiceInstanceTree()
      .then(namedServiceInstances => {




        var children: TreeNode[] = [];

        for (var idx = 0; idx < namedServiceInstances.length; idx++) {
          var namedServiceInstance = namedServiceInstances[idx];
          var grandChildren: TreeNode[] = []


          var childNode = new TreeNodeImpl(namedServiceInstance.serviceName, namedServiceInstance, grandChildren, false);
         // console.log("serviceName", namedServiceInstance.serviceName);

          children.push(childNode);

          var serviceInstances: ServiceInstance[] = namedServiceInstance.instances;

          for (var jdx = 0; jdx < serviceInstances.length; jdx++) {

            var serviceInstance = serviceInstances[jdx];
           // console.log("instanceId", serviceInstance.instanceId);
            var grandChildNode = new TreeNodeImpl(serviceInstance.instanceId, serviceInstances, null, true);
            grandChildren.push(grandChildNode);
          }
        }

        this.applicationServiceTree.length = 0; // clear the array
        this.applicationServiceTree.push(new TreeNodeImpl("Application", namedServiceInstances, children, false));






      })
  }

  showInstanceDetails(event) {
    //console.log("node event", event);
     if (this.selectedServiceInstance == null) {
      return;
    }

    if (!this.selectedServiceInstance.leaf) {
      return;
    }

    if ((this.selectedServiceInstance != null) && (this.selectedServiceInstance.leaf) && (this.selectedServiceInstance.leaf == true)) {
      this.displayInstanceDialog = true;
    }
  }

  serviceDialogClose(event) {
    this.selectedServiceInstance = null;

  }

  changeTreeLayout(event) {
    //console.log("change layout", this.toggleServiceTreeState)

    if (this.toggleServiceTreeState) {
      this.serviceTreeLayout = "vertical";
    } else {
      this.serviceTreeLayout = "horizontal";
    }
  }


  formatMsToHours(msecs) {
    var totalHours, totalMinutes, totalSeconds, hours, minutes, seconds, result = '';
    totalSeconds = msecs / 1000;
    totalMinutes = totalSeconds / 60;
    totalHours = totalMinutes / 60;

    seconds = Math.floor(totalSeconds) % 60;
    minutes = Math.floor(totalMinutes) % 60;
    hours = Math.floor(totalHours) % 60;


    if (hours !== 0) {
      result += hours + ' hr:';

      if (minutes.toString().length == 1) {
        minutes = '0' + minutes;
      }
    }

    result += minutes + ' min';

    if (seconds.toString().length == 1) {
      seconds = '0' + seconds;
    }

    result += seconds;

    return result;
  }


  formatMsToTime(ms: string) {

    /*
    var milliseconds: number = parseInt(ms);

    var seconds: number = Math.floor((milliseconds / 1000) % 60);
    var minutes: number = Math.floor((milliseconds / (1000 * 60)) % 60);
    var hours: number = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

    var hoursDisplay: string = (hours < 10) ? "0" + hours : "" + hours;
    var minutesDisplay: string = (minutes < 10) ? "0" + minutes : "" + minutes;
    var secondsDisplay: string = (seconds < 10) ? "0" + seconds : "" + seconds;

    return hoursDisplay + ":" + minutesDisplay + ":" + secondsDisplay + "." + milliseconds;
    */
    return "time"
  }
}
