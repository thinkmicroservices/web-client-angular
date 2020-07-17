import { LoggingLevel} from './logginglevel';

export interface Publisher {

	 
	error(timestamp:Date,message: any, ...optionalParams: any[]);

	warn(timestamp:Date,message: any, ...optionalParams: any[]);

	info(timestamp:Date,message: any, ...optionalParams: any[]);

	debug(timestamp:Date,message: any, ...optionalParams: any[]);

	


	
}