/* This is U, a program that thinks FROM natural languages NOT IN programming languages*/


const partager = require("./display/partager.js");
const valoriser = require ("./display/valoriser.js");
const jouer = require("./display/jouer.js");
const passer = require("./display/passer.js");
const acheter = require("./display/acheter.js");
const procurer = require("./display/procurer.js");
const contacter = require("./display/contacter.js");


//Utils
const anU = c => c!="" && (c=="(" || c==")" || c=="+" || c=="-" || c=="#" || c=="/" || c=="." || c=="@" || c==":" || c=="_" || c=="&" || c=="?" || c=="%")
const aD = c => c!="" && (c=="0" || c=="1" || c=="2" || c=="3" || c=="4" || c=="5" || c=="6" || c=="7" || c=="8" || c=="9")
const aM = c => c!="" && (c=="A" || c=="B" || c=="C" || c=="D" || c=="E" || c=="F" || c=="G" || c=="H" || c=="I" || c=="J" || c=="K" || c=="L" || c=="M" || c=="N" || c=="O" || c=="P" || c=="Q" || c=="R" || c=="S" || c=="T" || c=="U" || c=="V" || c=="W" || c=="X" || c=="Y" || c=="Z")
const decapsulated = text => {
    if (text.charAt(text.length-1)==")")
        return text.substring(text.charAt(0)=="("?1:0,text.slice(-1)==")"?text.length-1:text.length);
    return text;
}
const pointified = text => anU(text.charAt(text.length-1))?text:(text+".");

const buts = carte => {
    let options = ["vendre","vouloir","taster"] ; 
    let h = "";
    let colors = {
        "vendre":"#C32C57",
        "vouloir":"#2E6FCC",
        "taster":"#62275D"
    }
    for (let i = 0; i< options.length; i++)
        h += `<form>
                <button style="background-color:${colors[options[i]]}" hx-put="/${encodeURIComponent(`#(@+:+.(#(@+.+.(${carte}))/+.))/+.`)}" hx-target='closest .card' hx-swap='outerHTML'>${options[i].toUpperCase()}</button>
                <input type="hidden" name="o" value="(/+):${options[i]}:+.+."/>
              </form>`
    return h;
}

//Parser
const p = t => {
    var parsed=[];
    if (!t)
        return parsed;
    var le=t.length;
    
    ///Detecting Questions
    var last=t.slice(-1);
    if (last=="?")
        return [last+" ",t.substring(0,le-1)];

    ///Detecting Facts, Determination and Conjonctions

    var first=t.charAt(0);
    if (!anU(first))
        return [first,t.substring(1,le)];
    var op=0;
    var remaining=t;
    var counting_combi=-1;
    var verb_start=-1;
    var possession=-1;
    for (var j=0;j<le;j++) {
        var c=t.charAt(j);
        counting_combi=counting_combi+1;
        if (c=="(")
            op=op+1;
        else if (c==")")
            op=op-1;
        else if (op==0) {
            var n=t.charAt(j+1);
            if (c == '/' && (n == '+' || n=='-')) {
                parsed[0] = '/'+n ;
                parsed[1] = t.substring(0,j+1);
                parsed[2] = t.substring(j+3);
                break;
            }
            else if ((c=="+" || c=="-") && n=="." && t.charAt(j-1)!="_") {
                if (t.charAt(j-1)=="/") {
                    var plural= (t.charAt(j-2)=="/");
                    parsed[0]=(plural ? "//" : "/")+c+".";
                    parsed[1]="("+t.substring(0,j)+(plural ? "" : "/")+")."+(t.charAt(j+2)=="("?"":"(")+t.substring(j+2)+(t.charAt(le-1)==")"?"":")");
                    break;
                }
                else if (t.charAt(j-1)!="@") {
                    parsed[0]=c+".";
                    parsed[1]=decapsulated(t.substring(0,j));
                    parsed[2]=decapsulated(t.substring(j+2,last=="."?le-1:le));
                    break;
                }
            }
            else if ( c=="&" || (c=="." && t.charAt(j+1)=="(" && n!="") || c=="?" ||  (c=="_" && anU(n)) || j==(le-1) ) {
                if (!parsed[0] && j<(le-1))
                    parsed[0]=c;
                if (parsed[0]==c) {
                    parsed.push(decapsulated(remaining.substring(0,counting_combi)));
                    remaining=remaining.substring(counting_combi+1);
                    counting_combi=-1;
                }
            }
            else if (c==":" && n!="" && !anU(n) && verb_start==-1)
                verb_start=j+1;
            else if (c=="#" && possession==-1 && j>0 && ( t.charAt(j-1)==")" || t.charAt(j-1)=="+" || t.charAt(j-1)=="/" || !anU(t.charAt(j-1))))
                possession=j;
        }
    }
    var f=parsed[0];
    if (f) {
        if (f=="." || f=="?" || f=="&" || f=="_")
            parsed.push(decapsulated(remaining));
        if (f=="." && parsed[1].charAt(0)=="@" && !anU(parsed[1].charAt(1))) {
            var for_adj=[];
            for_adj[0]="@%";
            for_adj[1]=parsed[1].substring(1);
            var modifier=decapsulated(parsed[2]);
            var pm=p(modifier);
            if (pm[0]=="_")
                return for_adj.concat(pm);
            else {
                for_adj.push(parsed[2]);
                return for_adj;
            }
        }
        else
            return parsed;
    }
    var at=(first=="@");
    var postp=t.indexOf(":");
    if (at || last==":" || verb_start!=-1) {
        parsed[0]=(at?"@":"")+last;
        parsed[1]=verb_start!=-1?decapsulated(t.substring(at?1:0,verb_start-1)):decapsulated(t.substring(at?1:0,le-1))
        if (verb_start!=-1)
            parsed[2]=t.substring(verb_start,le-1)
        return parsed;
    }
    if (possession>0) {
        parsed[0]="%#";
        parsed[1]=decapsulated(t.substring(0,possession));
        parsed[2]=t.substring(possession);
        return parsed;
    }
    if (first=="#") {
        parsed[0]="#"+(last=="/"?t.charAt(le-2)=="/"?"//":"/":".");
        parsed[1]=decapsulated(t.substring(1,last=="/"?t.charAt(le-2)=="/"?(le-2):(le-1):last=="."?(le-1):le));
        return parsed;
    }
    if (first=="+") {
        parsed[0]="+";
        return parsed.concat(t.substring(1).split("_"));
    }
    else
        return p(decapsulated(t));
}
//Interpreter
exports.parse = p

/*
module.exports = (memory) => {
    const f = (t, memory, domain) => {
        return from(t, memory, domain)
    }
    return f
}
*/

// le_but est #(@+:+.(#(@+.+.({l'outil}))/+.))/+.

const from = async (memory, domain, t) => {
    t=t.replace(/\s/g,"");
    var parsed=p(t);
    //console.log(parsed);
    var f=parsed[0];
    if (f=="? ") {
        //console.log("This is a question on "+parsed[1]);
        let in_memory = await memory.get(domain+"/"+parsed[1]);
        if (in_memory)
            return "("+in_memory+")"
        let q = p(parsed[1]);
        //console.log("Need to decompose the question as "+q);
        if (q[0] == '.') {
            let k = p(q[1]);
            if (k[0] == "@.") {
                if (k[1] == "+html") {
                    //console.log("this is in HTML for "+q[2]);
                    let o = p(q[2]);
                    if (o[0] == ".") {
                        let c = p(o[1]);
                        if (c[0] == "/+") {
                            if (c[1] == "#carte/") {
                                let but = await from(memory,domain,`#(@+:+.(#(@+.+.(${o[1]}))/+.))/+.?`);
                                if (but == "?")
                                    return `
                                        <article class="card">
                                            ${buts(o[1])}
                                        </article>
                                    `
                                return `
                                    <article class="card">
                                        ${await from(memory,domain, "(@+html.).(#video/+.(@("+o[1]+").+.+.))?")}
                                    </article>
                                `
                            }
                        }
                    }
                    if (o[0] == "/+") {
                        if (o[1] == "#video/") {
                            let url = await from(memory, domain, "(@+www.).("+q[2]+")?");
                            if (url == "?")
                                return `
                                        <section class="media">
                                            <form>
                                                <label id="label_image" for="media">
                                                    <img id='image' for="media" src= 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAb1BMVEX///8AAAA+Pj7i4uLd3d1ISEhWVlb19fXIyMhra2vv7+/6+vrLy8sqKionJyfq6upbW1uXl5fR0dGnp6dwcHB8fHxQUFCIiIi0tLQgICAJCQmQkJBiYmIZGRm6urqUlJQ4ODijo6MVFRUxMTGCgoJHxlCNAAADT0lEQVR4nO3d4XaaQBBAYRQUlSiKiUk1SZuk7/+MPWhbJeywCCndGe/9a/f0fMmeWoUdooiIiIiIiIiIiIiIiIiIiEhP8XIcfqs+wmSkIYQIww8hwvBDiDD8ECIMv68TjvM4kDoJN7tppUlcE076/LC+tA7CdF373SeRJeGdY3ebEn53AC0JFzsX0JBw5vQZEj4KQCvCfCIBjQhfRZ8NYfbQALQgjH80AQ0Inxp9BoT3HqB2YfLNB/QK0/X8sgFc5/zCrdfXQtjiB/mv8v3V2bwFULMw2btJm+q7v17hm9u3n0U2hOmzG7hbRDaExbsbeChftCDcuH374viqfuFi6gauF6fX1Qtnwg7d/PkD2oXCR9334u863cJ87AY+p+d1qoWvwrv89nKdZqHwUfelqKzTK8yFj7rzrLruOmE2qzQcL6oJpY+628/rrhP+z6oQ4d/Qj6S2TqvQ3X1WX2dK+ORaZ0g4ru/QMjvCB8cOLTMjfJXWGREer167syF8bFhnQiju0DIDwsmicZ1+4cGzTr3Q+59j5cJd8w4t0y307dAyzcKXuzbrFAunqX9RpFm48S85plW4LPwrTmkVCh8kHGkVtl+HEOFwIZRCiHC4EEohRDhcCKUQIhwuhFIIEQ4XQimECIcLoRRChMOFUAohwuGqCu1fP1yZvwZs/zr+6AbuxbiB+2lG9u+JGt3AfW0jU/cmJsJJvKY7oMv0CMWzambuEY7k0TpG7vMui4XxSDbu1T8lnFkzcd7id1fvVHXCKHePmjNw7uncwU1Uf3btImmgnvLzh5elwk7VfYa0mrBTl5rPAX9q1mbaQJlaobhT+53HDythLk2vmQqBVQjz2XrMxQgtxyjkY91nm4TXm5u47zqfJsCKpdvYccZQiEmz9rrNiQozaV5il1lfgRav3MQO89pCLRPmlu5yK0Jx9uzVcxMDLhbe/a+cfRl0jTOgTQi9U5L1C6P4w7qwxU5VL2ycOG9D2PTUACPCKPppXih+2WhHKH4tbkcoftloSOh8EpItoTRA2ZBQ+LLRlFDdM7s61Oq5a+E8O6+S+1JhvRbPzgu1Pr9ahGGEEGH4IUQYfggRhh/CpuLlOPxWfYRERERERERERERERERERERa+gVTL0cqJsc+sQAAAABJRU5ErkJggg=='/>
                                                </label>
                                                <input accept="video/*" capture="camera" id="media" style="display:none" id="files-upload" type="file">
                                            </form>
                                        </section>
                                `
                            else 
                                return `
                                                <section class="media">
                                                    <video poster="${decapsulated(await from(memory,domain,'#image/.(+.@+.+./+.).@+www.?'))}" controls playsinline style="width:100%" src="${url}">
                                                    </video>
                                                </section>
                                        `
                            
                        }
                    }
                }
            }
        }
        return "?";
        /*
        var in_memory=await memory.get(domain+parsed[1]);
        if (in_memory)
            return "("+in_memory+")";
        else {
            var q = p(parsed[1]);
            if (q[0] == ".") {
                q=q.slice(1);
                var l = q.length;
                var answer = await memory.get(domain+q[0])
                var j = 1;
                while (answer.length > 0 && j < l) {
                    var l2 = await memory.get(domain+q[j]);
                    var l3 = [];
                    var k=0;
                    for (var i=0; i < answer.length; ++i)
                        if (l2.indexOf(answer[i])!=-1)
                            l3[k++]=answer[i];
                    answer = l3 ;
                    j++;
                }
                if (answer.length == 0)
                    return "?";
                else
                    return "("+answer.map(function(el) {return "("+el+")";}).join("&")+")";
            }
            else if (q[0] == "/+.") {
                var intersection = await from(q[1]+"?");
                if (intersection == "?")
                    return intersection;
                else {
                    var data = p(intersection);
                    if ("&_.?".indexOf(data[0].charAt(0))==-1)
                        return intersection
                    else
                        return "("+data.slice(1).join("?")+")";
                }
            }
            return "?"
        }
        */
    }
    else if (f=="+.") {
        var psub=p(parsed[1]);
        var pobj=p(parsed[2]);
        
        if (".?&_".indexOf(psub[0])==-1 && ".?&_".indexOf(pobj[0])==-1) {
            if (psub[0]=="@." || psub[0]==":" || psub[0]=="@:") {
                var subordinated=parsed[1]+"+.+.";
                var obj=pointified(parsed[2]);
                var in_m=memory[obj];
                if (!in_m || in_m.indexOf("("+subordinated+")")==-1) {
                    addToMemory(subordinated,obj,"position");
                    if (psub[0]=="@.")
                        var indirected="@+"+(psub[2]?":"+psub[2]+".":".")+"+."+obj;
                    else if (psub[0]=="@:")
                        var indirected="@+"+(psub[2]?":"+psub[2]+":":":")+"+."+obj;
                    else
                        var indirected="+:"+(psub[2]?(psub[2]+":"):"")+"+."+obj;
                    addToMemory(indirected,pointified(psub[1]),"position");
                    saveMemoryTo("U.json",function() {
                    });
                }
            }
            else if (pobj[0]="#/") {
                var plural=parsed[2]+"/";
                var obj=pointified(parsed[1]);
                //console.log("one is between "+obj+" and "+plural);
                
                var in_m=memory[obj];
                if (!in_m || in_m.indexOf("("+parsed[2]+")")==-1) {
                    addToMemory(plural,obj,"type");
                    saveMemoryTo("U.json",function() {
                    });
                }
            }
            return  "+ok.";
        }
        else {
            return "?";
        }
    }
    else if (f=="-.") {
        var psub=p(parsed[1]);
        var pobj=p(parsed[2]);
        if (psub[0]=="@." || psub[0]=="@:" ) {
            var key="@"+psub[1]+":"+psub[2]+psub[0].charAt(1)+"+.+.";
            var current = memory[key];
            var obj = pointified(parsed[2]);
            if (current && current.indexOf("("+obj+")")!=-1) {
                var nextCurrent = (current+"&").replace("("+obj+")&","");
                //console.log("next current 1 is "+nextCurrent.substring(0,nextCurrent.length-1)+" for "+key)
                if (nextCurrent == "")
                    delete memory[key];
                else
                    memory[key]= nextCurrent.substring(0,nextCurrent.length-1);
                var current2 = memory[obj]+".";
                var nextCurrent2 = current2.replace("("+key+").","");
                //console.log("next current 2 is "+nextCurrent2.substring(0,nextCurrent2.length-1)+" for "+obj)
                if (nextCurrent2 == "")
                    delete memory[obj];
                else
                    memory[obj] = nextCurrent2.substring(0,nextCurrent2.length-1);
                var subj = pointified(psub[1]);
                var current3 = memory[subj]+".";
                var key2 = "@+:"+psub[2]+psub[0].charAt(1)+"+."+obj;
                var nextCurrent3 = current3.replace("("+key2+").","");
                //console.log("next current 3 is "+nextCurrent3.substring(0,nextCurrent3.length-1)+" for "+subj)
                if (nextCurrent3 == "")
                    delete memory[subj];
                else
                    memory[subj] = nextCurrent3.substring(0,nextCurrent3.length-1);
                var current4 = memory[key2]+"&";
                var nextCurrent4 = current4.replace("("+subj+")","");
                //console.log("next current 4 is "+nextCurrent4.substring(0,nextCurrent4.length-1)+" for "+key2)
                if (nextCurrent4 == "")
                    delete memory[key2];
                else
                    memory[key2] = nextCurrent4.substring(0,nextCurrent4.length-1);
                saveMemoryTo("U.json",function() {
                    return "+ok.";
                });
            }
            else
                return "+ok.";
        }
        else 
            return "+ok.";
    }
    else if (f=='.' && parsed[1]=="@+english.") {
        var english="";
        if (parsed[2]=="?")
            return "?";
        var toe=p(parsed[2]);
        var fi=toe[0];
        if (fi=="+") {
            for (var i=1;i<toe.length;i++) {
                var w=toe[i].charAt(toe[i].length-1)=="."?toe[i].substring(0,toe[i].length-1):toe[i];
                english+=w.charAt(0).toUpperCase()+w.substring(1,w.length)+" ";
            }
            english=english.substring(0,english.length-1);
        }
        else if (!anU(fi.charAt(0))) {
            english=fi+toe[1];
        }
        else if (fi=="#." || fi=="#/" || fi=="#//") {
            english=(fi=="#."?"every ":fi=="#/"?"one ":"")+await from("(@+english.).("+toe[1]+")")+(fi=="#//"?"s":"");
        }
        else if (fi=="/+." || fi=="//+.") {
            english="the "+await from("(@+english.).("+toe[1]+")");
        }
        else if (fi=="+." || fi=="-.") {
            var sub=p(toe[1]);
            var obj=p(toe[2]);
            var head=await from("(@+english.).("+toe[1]+")");
            var tail=await from("(@+english.).("+toe[2]+")");
            if (sub[0]=="@." || sub[0]=="@:" || sub[0]==":") {
                var verb=sub[2];
                var subor=p(sub[1])[0];
                var fact=(obj[0]=="+." || obj[0]=="-.");
                if (subor=="+." || subor=="-.")
                    english=head+", "+tail;
                else if (!verb) {
                    if (sub[0]==":" && fact && p(obj[1])[0]=="@:" && !p(obj[1])[2]) {
                        english=head+", "+await from("(@+english.).("+obj[1]+")")+" , that "+await from("(@+english.).("+obj[2]+")");
                    }
                    else
                        english=(fact?head+", ":sub[1]=="+"?head+" is ":tail+" is ")+(fi=="+."?"":"not ")+((fact || sub[1]=="+")?tail:head);
                }
                else {
                    if (fi=="+.")
                        english=head+" "+((obj[0]=="+." || obj[0]=="-.")?" that ":"")+tail;
                    else {
                            var aux=head.indexOf("did")!=-1?(head.indexOf("did")+4):head.indexOf("will")!=-1?(head.indexOf("will")+5):(head.indexOf("is")+3);
                            english=head.substring(0,aux)+"not "+head.substring(aux)+" "+((obj[0]=="+." || obj[0]=="-.")?" that ":"")+tail
                    }
                }
            }
            else
                english=head+" is "+tail; 
        }
        else if (fi=="@." || fi=="@:" || fi==":") {
            var verb=toe[2];
            var sub=p(toe[1]);
            var fact=(sub[0]=="+." || sub[0]=="-.")
            if (!verb)
                english=(fact?(fi=="@."?"while ":fi==":"?"because ":"to that "):(fi=="@."?"at ":fi=="@:"?"to ":"from "))+(toe[1]=="+"?" which ":await from("(@+english.).("+toe[1]+")"));
            else
                english=((fact || toe[1]=="+")?"that ":await from("(@+english.).("+toe[1]+")"))+" "+(fi=="@:"?("will "+verb):fi==":"?("did "+verb):("is "+verb.substring(0,verb.charAt(verb.length-1)=="e"?verb.length-1:verb.length)+"ing"));
        }
        else if (fi=="." || fi=="&" || fi=="_" || fi=="?") {
            for (var i=1;i<toe.length-1;i++)
                english+=((fi=="_"&&i!=1)?" then ":"")+await from("(@+english.).("+toe[i]+")")+", ";
            english=english.substring(0,english.length-2)+(fi=="?"?" or ":fi=="_"?" then ":(fi=="&" || toe.length>3)?" and ":" ")+await from("(@+english.).("+toe[toe.length-1]+")");
        }
        else if (fi=="%#") {
            english=await from("(@+english.).("+toe[2]+")")+" of "+await from("(@+english.).("+toe[1]+")");
        }
        else if (fi=="@%") {
            if (toe[2]=="_") {
                if (toe[3]=="-")
                    english="least "+toe[1];
                else if (toe[4]=="-.")
                    english="most "+toe[1];
                else if (toe[3]=="+")
                    english="less "+toe[1]+" than "+await from("(@+english.).("+toe[4]+")");
                else if (toe[4]=="+.")
                    english="more "+toe[1]+" than "+await from("(@+english.).("+toe[3]+")");
            }
            else
                english="as "+toe[1]+" as "+await from("(@+english.).("+toe[2]+")");
        }
        else if (fi=="? ") {
            english=await from("(@+english.).("+toe[1]+")")+" ?";
        }
        return english;
    }
    else if (f=='.' && parsed[1]=="@+html.") {
      var toe = p(parsed[2]);
      var fi = toe[0];
      if (fi == "." || fi == "&") {
        return `<ul>${toe.slice(1).map(x => `<li>${from(`(@+html.).(${x})`)}</li>`).join("")}</ul>`
      }
      else { 
        var plural = fi == "#/" ? "/":"";
        return `<a href="#" class="u-link" id="${parsed[2]+plural}?">${await from(`(@+english.).(${parsed[2]})`)}</a>`
      }
    }
    else
        return "?";
}
exports.s = from