import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { MetadataFactory } from '@angular/compiler/src/core';
import { TreeNode } from 'primeng/api';
import { ApiService } from '../api-service/api-service.service';
import { LoggingService } from '../logging/logging.service';
import { first } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class TreeNodeService {

  constructor(private httpClient: HttpClient,
    private apiService: ApiService,
    private logger: LoggingService) { }


  public getServiceInstanceTree()  {
    
  //  var serviceTreeURL = "http://localhost:9999/getServiceInstances?ts=" + (new Date()).getTime();
    var serviceTreeURL = this.apiService.getAdminService()+"/getServiceInstances?ts=" + (new Date()).getTime();

    return this.httpClient.get<NamedServiceInstance[]>(serviceTreeURL).toPromise()
      .then(res => <NamedServiceInstance[]>res).then(data => {


        //console.log(data);

        return data;
      })
  }
}

export class TreeNodeImpl implements TreeNode {

  label: string;
  data: any;
  expandedIcon: string ;
  collapsedIcon: string ;
  children: TreeNode[];
  leaf: boolean;

  constructor(label: string, data: any, children: TreeNode[],leaf: boolean) {
    this.label = label;
    this.data = data;
    this.children = children;
    this.expandedIcon= "fa fa-folder-open";;
    this.collapsedIcon  = "fa fa-folder";
    this.leaf=leaf;
  }
}
/*
export class ApplicationInstance extends TreeNodeImpl {

  constructor(services: NamedServiceInstance[]) {
   var children:  NamedServiceInstance[]=[];

    services.forEach(function (value) {
      console.log(value);
     children.push(value);
  });
    super("Application", services, children);
  }
}
*/

export class NamedServiceInstance extends TreeNodeImpl {
  serviceName: string;
  instances: ServiceInstance[];

  constructor(serviceName: string, instance: ServiceInstance[]) {
    super(serviceName, instance, instance,false);
    this.serviceName = serviceName;
    


  }
}

export class ServiceInstance extends TreeNodeImpl {



   
  private metadata: MetaData;
  private secure: boolean;
  private serviceId: string;
   instanceId: string;
  private uri: string;

  private instanceInfo: InstanceInfo;

  private host: string;
  private port: number;
  private scheme;



}


export class MetaData {
  private 'management.port': string;
}

export class InstanceInfo {
  constructor() { }
  private instanceId: string;
  private app: string;
  private appGroupName: string;
  private ipAddr: string;
  private sid: string;
  private homePageUrl: string;
  private statusPageUrl: string;
  private healthCheckUrl: string;
  private secureHealthCheckUrl: string;
  private vipAddress: string;
  private secureVipAddress: string;
  private countryId: number;
  private dataCenterInfo: DataCenterInfo;
  private hostName: string;
  private status: string;
  private overriddenStatus: string;
  private leaseInfo: LeaseInfo;

  private isCoordinatingDiscoveryServer: boolean;
  private metaData: MetaData;
  private lastUpdatedTimestamp: number;
  private lastDirtyTimestamp: number;
  private actionType: number;
  private asgName: string;

}


export class DataCenterInfo {
  constructor() { }
  private '@class': string;
  private name: string;
}

export class LeaseInfo {

  constructor() { }
  private renewalIntervalInSecs: number;
  private durationInSecs: number;
  private registrationTimestamp: number;
  private lastRenewalTimestamp: number;
  private evictionTimestamp: number;
  private serviceUptTimestamp: number;

}


