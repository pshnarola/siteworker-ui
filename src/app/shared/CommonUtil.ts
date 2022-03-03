import { environment } from '../../environments/environment';



export class CommonUtil {

    static createExternalURLForProject(projectTitle, projectId) {

        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;
        projectTitle = projectTitle.replace(/ +/g, "");
        const Url = `${protocol}//${host}:${port}/#/preview/project-external-detail?title=${projectTitle}&id=${projectId}`;
        return Url;
    }

    static createExternalURLForProfile(name, id, route) {

        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;
        name = name.replace(/ +/g, "");
        const Url = `${protocol}//${host}:${port}/#/preview/${route}?name=${name}&id=${id}`;
        return Url;
    }

    static createExternalURLForJob(jobTitle, jobId) {

        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;
        jobTitle = jobTitle.replace(/ +/g, "");
        const Url = `${protocol}//${host}:${port}/#/preview/job-external-detail?title=${jobTitle}&id=${jobId}`;
        return Url;
    }


    static openWindow(url: string) {
        const customUrl = '#' + url;
        // url = '/preview/worker-profile-detail?user=03';
        // use like in respective components CommonUtil.openWindow("/preview/worker-profile-detail?user=03");
        window.open(customUrl, '_blank');
    }

    static openWindowForExternalurl(url: string) {
        window.open(url, '_blank');
    }


    static getApiEndPointPath(): string {
        return environment.apiEndPoint;
    }

    static getBaseURL(): string {
        return environment.baseURL;
    }

    static getCkEditorConfig(): any {
        return {
            height: '350',
            removeButtons: "Save,NewPage,Preview,Print,Templates,Find,Replace,Form,ImageButton,HiddenField,Language,Link,UnLink,Anchor,Image,Flash,PageBreak,Iframe,Maximize,ShowBlocks,About"
        };
    }

    static getLineChartConfig(): any {
        return {
            fullWidth: true,
            height: '300px',
            //width:'1100px',

            chartPadding: {
                right: 40
            },
            tooltips: {
                mode: 'label'
            },
            axisY: {
                labelInterpolationFnc: function (value) {
                    if (Math.floor(value) === value) {
                        return value;
                    }
                }
            }
        }
    }

    static getBarChartConfig(): any {
        return {
            fullWidth: true,
            height: '300px',
            axisY: {
                labelInterpolationFnc: function (value) {
                    if (Math.floor(value) === value) {
                        return value;
                    }
                }
            }
        }
    }

    static convertUserResponseToChartData(object, year, lastYear, type): any {
        let labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let series = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
        if (type === 'ALL') {
            labels = [];
            series = [[]];
            if (year && lastYear) {
                for (let i = 0; i <= (lastYear - year); i++) {
                    labels.push(year + i);
                    series[0].push(0);
                }
            }
        } else if (type === 'YEAR') {
            labels = [];
            series = [[]];
            if (year && lastYear) {
                for (let i = 0; i <= (lastYear - year); i++) {
                    labels.push(year + i);
                    series[0].push(0);
                }
            }
        } else if (type === 'week') {
            labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
            series = [[0, 0, 0, 0, 0, 0, 0]];
        }

        if (object && object.length) {
            object.map(e => {
                if (type === 'month') {
                    series[0][e.month - 1] = e.total;
                } else if (type === 'week') {
                    series[0][e.day - 1] = e.total;
                } else {
                    let index = labels.indexOf(e.year);
                    series[0][index] = e.total;
                }
            });
        }
        return {
            labels,
            series
        }
    }

    static convertSubscriptionResponseToChartData(object, year, lastYear, type): any {
        let SUBSCRIPTION_TYPE = ['_1', '_6', '_12'];
        let labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let series = [];
        if (type === 'year') {
            if (year && lastYear) {
                labels = [];
                for (let i = 0; i <= (lastYear - year); i++) {
                    labels.push(year + i);
                }
            }
        } else if (type === 'week') {
            labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
        }

        SUBSCRIPTION_TYPE.map(item => {
            let data = [];
            labels.map(e => {
                data.push(0);
            });
            series.push(data);
        });

        if (object && object.length) {
            let _3MonthData = object[0]._1;
            let _6MonthData = object[0]._6;
            let _12MonthData = object[0]._12;
            if (_3MonthData && _3MonthData.length) {
                _3MonthData.map(e => {
                    if (type === 'month') {
                        series[0][e.month - 1] = e.total;
                    } else if (type === 'week') {
                        series[0][e.day - 1] = e.total;

                    } else {
                        let index = labels.indexOf(e.year);
                        series[0][index] = e.total;
                    }
                });
            }
            if (_6MonthData && _6MonthData.length) {
                _6MonthData.map(e => {
                    if (type === 'month') {
                        series[1][e.month - 1] = e.total;
                    } else if (type === 'week') {
                        series[1][e.day - 1] = e.total;

                    } else {
                        let index = labels.indexOf(e.year);
                        series[1][index] = e.total;
                    }
                });
            }

            if (_12MonthData && _12MonthData.length) {
                _12MonthData.map(e => {
                    if (type === 'month') {
                        series[2][e.month - 1] = e.total;
                    } else if (type === 'week') {
                        series[2][e.day - 1] = e.total;

                    } else {
                        let index = labels.indexOf(e.year);
                        series[2][index] = e.total;
                    }
                });
            }
        }
        return {
            labels,
            series
        }
    }

    static getYearAndLastYearForChart(type): any {
        const date = new Date();
        if (type === 'month' || type === 'week' || type === 'ALL') {
            return {
                'year': date.getFullYear(),
                'lastYear': date.getFullYear()
            }
        } else if (type === 'year') {
            return {
                'year': date.getFullYear() - 5,
                'lastYear': date.getFullYear()
            }
        }
    }

}
