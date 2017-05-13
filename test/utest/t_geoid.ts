/*------------------------------------------------------------------------------
* rtklib unit test driver : geoid functions
*-----------------------------------------------------------------------------*/
// #include <stdio.h>
// #include <math.h>
// #include <assert.h>
// #include "../../src/rtklib.h"
import {D2R,opengeoid,GEOID_EGM96_M150,GEOID_EGM2008_M10,GEOID_EGM2008_M25,GEOID_GSI2000_M15,GEOID_EMBEDDED,geoidh,closegeoid} from "../../binding/rtk";

function assert(val : boolean){
    if (!val){
        console.log("error");
    }
}

/* latitude, longitude, geoid height (m) */
/* reference : http://sps.unavco.org/geoid */
const poss = [
    [ 90.001*D2R,  80.000*D2R,  0.000],
    [-90.001*D2R,  80.000*D2R,  0.000],
    [ 30.000*D2R, 360.000*D2R,  0.000],
    [-30.000*D2R,-360.001*D2R,  0.000],
    [-90.000*D2R, 359.999*D2R,-29.534],
    [ 90.000*D2R,  80.000*D2R, 13.606],
    [-90.000*D2R, -60.000*D2R,-29.534],
    [ 30.000*D2R,-360.000*D2R, 35.387],
    [-30.000*D2R, 359.999*D2R, 21.409],
    [ 10.000*D2R,  45.000*D2R,-20.486],
    [-60.123*D2R, 135.123*D2R,-33.152],
    [ 19.999*D2R, 135.000*D2R, 41.602],
    [ 50.001*D2R, 135.000*D2R, 20.555],
    [ 35.000*D2R, 119.999*D2R,  4.386],
    [ 35.000*D2R, 150.001*D2R, 14.779],
    [ 20.000*D2R, 120.000*D2R, 21.269],
    [ 50.000*D2R, 150.000*D2R, 20.277],
    [ 35.000*D2R, 135.000*D2R, 36.355],
    [ 45.402*D2R, 141.750*D2R, 27.229], /* wakkanai */
    [ 24.454*D2R, 122.942*D2R, 21.652], /* ishigaki */
    [ 33.120*D2R, 139.797*D2R, 43.170], /* hachijo */
    [ 30.000*D2R, 135.000*D2R, 36.017], /* taiheiyo */
    [0,0,0]
];

const DATADIR = "../../../../data/geoiddata/";
const file1= "WW15MGH.DAC";
const file2= "Und_min1x1_egm2008_isw=82_WGS84_TideFree_SE";
const file3= "Und_min2.5x2.5_egm2008_isw=82_WGS84_TideFree_SE";
const file4= "gsigeome.ver4";

/* opengeoid(), closegeoid() */
function utest1(){
    //int ret;
    
    let ret=opengeoid(10,file1);
        assert(ret==0); /* no model */
    ret=opengeoid(GEOID_EGM96_M150,"../../../geoiddata/WW15MGH.DAA");
        assert(ret==0); /* no file */
    ret=opengeoid(GEOID_EMBEDDED,"");
        assert(ret==1);
    closegeoid();
    ret=opengeoid(GEOID_EGM96_M150,file1);
        assert(ret==1);
    closegeoid();
    ret=opengeoid(GEOID_EGM2008_M10,file2);
        assert(ret==1);
    closegeoid();
    ret=opengeoid(GEOID_EGM2008_M25,file3);
        assert(ret==1);
    closegeoid();
    ret=opengeoid(GEOID_GSI2000_M15,file4);
        assert(ret==1);
    closegeoid();
    
    printf("%s utset1 : OK\n",__FILE__);
}
/* print difference */
function printgeoid(pos : number[], h : number[],  n : number) : void{
    //int i;
    printf("%7.3f %8.3f %9.4f: ",pos[0]*R2D,pos[1]*R2D,pos[2]);
    for (let i=0;i<n;i++) printf(" %9.4f",h[i]);
    printf(" :");
    for (let i=1;i<n;i++) printf(" %9.4f",h[i]!=0.0?h[i]-h[0]:0.0);
    printf("\n");
}
/* geoidh() (1) */
function utest2(){

    double h[64][6]={{0}};
    let j=0;
    
    opengeoid(GEOID_EGM96_M150,file1); /* reference */
    for (let i=0;poss[i][0]!=0.0;i++) {
        h[i][j]=geoidh(poss[i]);
    }
    j++;
    closegeoid();
    
    opengeoid(GEOID_EMBEDDED,"");
    for (let i=0;poss[i][0]!=0.0;i++) {
        h[i][j]=geoidh(poss[i]);
    }
    j++;
    closegeoid();
    
    opengeoid(GEOID_EGM2008_M10,file2);
    for (let i=0;poss[i][0]!=0.0;i++) {
        h[i][j]=geoidh(poss[i]);
    }
    j++;
    closegeoid();
    
    opengeoid(GEOID_EGM2008_M25,file3);
    for (let i=0;poss[i][0]!=0.0;i++) {
        h[i][j]=geoidh(poss[i]);
    }
    j++;
    closegeoid();
    
    opengeoid(GEOID_GSI2000_M15,file4);
    for (let i=0;poss[i][0]!=0.0;i++) {
        h[i][j]=geoidh(poss[i]);
    }
    j++;
    closegeoid();
    
    for (let i=0;poss[i][0]!=0.0;i++) {
        printgeoid(poss[i],h[i],5);
        
        assert(Math.abs(h[i][0]-poss[i][2])<1.0);
    }
    printf("%s utset2 : OK\n",__FILE__);
}
/* geoidh() (2) */
function utest3() : void{
    double pos[3],h[6],dhmax[6],dh;
    //int i,j,k,
    let nlat=113,nlon=237;
    
    for (let i=0;i<=nlat;i++) for (let j=0;j<=nlon;j++) {
        pos[0]=(90.0-i*180.0/nlat)*D2R;
        pos[1]=j*360.0/nlon*D2R;
        pos[2]=0.0;
        opengeoid(GEOID_EGM96_M150,file1); /* reference */
        h[0]=geoidh(pos);
        closegeoid();
        opengeoid(GEOID_EMBEDDED,"");
        h[1]=geoidh(pos);
        closegeoid();
        opengeoid(GEOID_EGM2008_M10,file2);
        h[2]=geoidh(pos);
        closegeoid();
        opengeoid(GEOID_EGM2008_M25,file3);
        h[3]=geoidh(pos);
        closegeoid();
        opengeoid(GEOID_GSI2000_M15,file4);
        h[4]=geoidh(pos);
        closegeoid();
        printgeoid(pos,h,5);
        for (k=1;k<5;k++) {
            dh=h[k]!=0.0?h[k]-h[0]:0.0;
            if (Math.abs(dh)>Math.abs(dhmax[k])) dhmax[k]=dh;
        }
    }
    printf("max difference                                                                 :");
    for (i=1;i<5;i++) {
        printf(" %9.4f",dhmax[i]);
        assert(Math.abs(dhmax[i])<10.0);
    }
    printf("\n");
    printf("%s utset3 : OK\n",__FILE__);
}
//int main(void)
{
    utest1();
    utest2();
    utest3();
  //  return 0;
}
