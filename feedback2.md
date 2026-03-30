Transcript
March 23, 2026, 2:04PM
 
Agrawal, Mayurika started transcription
 
Agrawal, Mayurika   0:04
Yes. So hello everyone. We had a meeting last time regarding the mock UI which was developed by the HCL team. They showcased and we received a feedback from Titu and Aruna on that. So the team has worked on the mock UI, the feedback which was given and they are ready with the feedback updated.
In their diagram. So you can go ahead and share your screen and explain the updated mock UI.
 
Juhitha Reddy Arumalla [External]   0:34
Sure, Marika. Thanks. Good morning everyone. Thanks for joining the call today. Just to mention, I'm demonstrating this from my HCL laptop, so moving the setup to a client domain requires additional configuration. So just for showing the functionality, I'll I'll go ahead and proceed in HCL environment itself.
Uh, Mohan, I uh, like, I guess that would be OK with you, I hope.
 
Reddy, Mohan S   0:57
Yeah, that's fine. You know, we'll have to work with, you know, with it. Yes, go ahead.
 
Juhitha Reddy Arumalla [External]   1:00
Sure. Yeah. Thanks. Thanks.
Uh, sorry people, just a second.
I hope all of you can see my screen Mayurika.
 
Chandrasekhar, Aruna   1:49
Yes.
 
Reddy, Mohan S   1:49
Yeah, we we can see it.
 
Juhitha Reddy Arumalla [External]   1:49
So yeah, so based on the feedback we received in the previous one, we have prepared for the second version of the dashboard. So in this version we are more focused on improving incident visibility, investigation workflow and root cause analysis so that teams can quickly.
 
Agrawal, Mayurika   1:49
Yes, Jyotham.
 
Juhitha Reddy Arumalla [External]   2:05
Understand and resolve the issues. Let me walk you through the updated one. First one, this is the Executive dashboard which provides a real time overview of the systems. At the top we'd like to display the key metrics like active clusters, critical alerts and impacted services. These metrics basically gives operations team.
A quick snapshot of the current system's health. Below that we have the live incident section where all the active incidents are listed so users can easily filter incident based on the severities like critical, high, medium and low.
So we have already added the insert archive section too where you can. I mean this allows users to see like previously resolved incidents. Users can filter the last 30 days ones, the last seven days one and the custom ones where we can give the from date and to date to see.
You know which basically helps team analyzes the historical issues and learn from past incidents now.
If we go to the investigation workspace here for the like it will give us first the AI generator summary that quickly explains what happened during the incident. Here we have provided the drop down where we can give the alert ID or alert name and see what's going on with it where it will.
Provide the AI summary 1st and root cause analysis next. Here's the system identifies the most likely root cause and provides a confidence score. Like here we can see 94% confidence. This helps teams quickly understand what might have triggered the issue and where they should focus their investigation.
Below that, we have the incident timeline. This shows a sequence of important events such as deployments, alerts, spikes, CPU saturations, and authentication failures. The timeline helps to understand how the incident progressed over time.
On the right side, we do have the blast radius section which shows the services impacted by the incident. This helps teams quickly see which services are affected and understand the overall impact of the system.
Another feature we have added is similar past incidents. The system automatically identifies you know incidents from the past that are similar to the current issue and shows how those incidents were resolved. So this helps engineers you know apply proven solution and resolve the.
Problems faster. Next we have dependencies map. This where I'll try to choose my 10.
Here users can interact with the system using natural language and ask questions about the incident where just one second. Here we have also given the drop down same like the investigation workspace where we can give the name or ID.
And get the topology map. Here there are total nodes and number of root causes and how many are impacted and how many are healthy and how many are like dependencies coming to the tries.
In the final section we have the conversational trace feature. Here engineers can interact with the system using the same natural language and you know, ask questions about that such as what caused the issue or how can it lead resolved. This provides quick guidance through the troubleshooting and here we can also.
See the here in the drop down. First suppose if I want to ask questions about my database connection pool exhaustion, then it will get like it will quickly give that active chat and also provided the history of what that particular user have asked it before.
So yeah, this is what we have prepared. Any questions till now?
 
Reddy, Mohan S   6:15
Karun, you know, Aruna, you guys chime in. I I think you know what I like about it is, you know, it's not overwhelming. I mean, it's it's, you know, then again, I want to know if, you know, we're missing something very important, Robert.
But at least it's not, it's not jumping out and it's, you know, the very first look is not confusing to me and that's that's that's good, that's on the right track. But what what was changed? I mean, I know that there was some rebalancing done. I don't know. Have we taken steps in that direction or do you still see gaps or what do you think?
 
Chandrasekhar, Aruna   6:51
Definitely from the first review that we've seen, this has been toned down, you know, made it much more simpler. So as you said, Mohan, I think we are moving in the right direction.
 
Reddy, Mohan S   7:05
Yep, that's that's OK.
 
Chandrasekhar, Aruna   7:07
So on the whole, I like the way you are proceeding, Juhita, um but I think we would still need to kind of fix what we want to do because there's a lot of things brought out, right? Your investigation and topology and there's a lot of information.
 
Reddy, Mohan S   7:21
Yeah.
 
Chandrasekhar, Aruna   7:26
And so I think what is important is probably some of this we would keep as space holders because if you try to put everything on the first scope, we will, we would not get it because I don't think we have the data to support that.
Right. The way we are going to have it because especially your dependency and all that we we would have to kind of define what we want to do first as our MVP, right. I go back to that because that will help us shape how how we want this dashboard to look and.
What is useful for the SWAT team? So So that that is my first impression on that. Karan, do you have anything to add before I go further and show what we came up with our idea? And it's kind of similar, but I just want to clarify that.
 
Subramanian, Karun   8:22
Sure. Um, Johita, what is in the active clusters? Sorry, I may have. I may have missed it when you drilled down.
Is there a drill down there or no, just a?
 
Juhitha Reddy Arumalla [External]   8:35
It's just showing the number. Basically it cluster is a group of related alerts, right? We just wanted to show them how many groups are present and that that's the main motive.
 
Subramanian, Karun   8:40
OK.
Yeah.
OK, so that's that's, you know, that's one of the critical IPS of this project because AI is going to group things for us versus someone trying to connect the dots between multiple alerts, right? So because interlink is just one record at a time that they can analyze, but whereas.
If AI can cluster this, that's a great, I would say value add for this project. So that's good. But so you answered it, it's gonna be grouping of similar alerts, alright.
 
Chandrasekhar, Aruna   9:18
Asian.
 
Subramanian, Karun   9:21
Now, one thing that crossed my mind was your investigation and root cause analysis, right? We want to be careful here. So the objective of the project is to help SWAT teams with the reducing the alert noise and get some intelligence out of all the events that are happening.
 
Reddy, Mohan S   9:35
Yeah.
 
Subramanian, Karun   9:39
Based on interlinked data, right, we may not have all the necessary data to suggest a potential root cause and also there are very there are many tools now that that are popping up including in our own homegrown and.
And few others in the name of RCA. I think RCA can absolutely be something down the line once we have all the data and once we have the alert, sanitization works fine, right? That's the main goal of this project to help us SWAT team member with.
All the various other that's going on, I think the placeholder is fine, but I don't want us to try to build a full blown root cause analysis tool based on what we see in interlink. That's one feedback I have.
I'd say that also means we should focus more on the getting the intelligence out of these alerts, such as, you know, creating clusters and perhaps anomalies. So I think along those lines, but from strictly from a UI perspective, it absolutely looks good.
Dollars point.
Also make sure the the search is available. OK, so you have that search already here. So it's a name. What is the name that you're thinking? It's a service name, right? Search by name or ID.
 
Juhitha Reddy Arumalla [External]   11:01
Yeah, service name or ID both. I'm thinking as of now.
 
Subramanian, Karun   11:04
OK.
Because that is, if I put myself in SRE shoes, that is an another. I think it should be easy for someone to just go in and type in this application name and then retrieve everything that this tool knows about that application in terms of what's happening in the environment.
See listing of alerts is fine, but then we can get a lot of those lists in other tools as well. Always keep thinking about what sort of a deduction that the tool can do and then surface that as the you know as the as as the easy easily accessible item within the UI.
 
Juhitha Reddy Arumalla [External]   11:45
We'll definitely keep that as a note, Karan, yeah.
 
Subramanian, Karun   11:49
Yeah. So again, at a high level, uh, pare down the RCA side of things. Um, I I Mohan or others chime in. Uh.
 
Reddy, Mohan S   11:52
Yeah.
Yeah.
 
Subramanian, Karun   11:58
Yeah. Otherwise, uh, just from the look and feel, I think it's much better than a lot of noise, yes.
 
Reddy, Mohan S   12:04
Yeah, I I I agree. And you know, I, I, you know, I'd like to understand when is this thing actually going to work on real data? You know, where you've interfaced with our system, so you're pulling real stuff so we can take a look at some, you know, one or two examples.
 
Subramanian, Karun   12:19
Yeah, I mean obviously we got to get the data pipeline going, Mohan. So it's a 10 week project. If I just, you know, take a step back, we do want to have an MVP going 10 weeks from today, but I do expect some real world data already flowing in somewhere during the mid part of this project.
 
Reddy, Mohan S   12:25
Yeah.
See that's Karun, that's exactly that's you know you that's what I wanted to touch on. I mean there's do you see any risk in opening up that data pipeline as we iterate through because you know we, you know this UI will change in some format, you know we're going to all have some opinions.
 
Subramanian, Karun   12:41
Mhm.
 
Reddy, Mohan S   12:53
You know, we it doesn't need to be perfect. I I, you know, if there's no operational risk and if you know Juhita, you and HCL, you guys have all the required permissions to to actually bring in the real data and then we can we can sit and do the same demo.
 
Subramanian, Karun   12:55
Right.
 
Reddy, Mohan S   13:10
We can go through some recent incidents because you're going to be looking at the latest stuff coming in. You know, I think that'll open up some good questions and you know, any direction changes we need to make will become a little bit easier at that point or at least we'll know which way we want to go.
 
Juhitha Reddy Arumalla [External]   13:26
Yeah, Mohan, that was the primary idea. But So what our motto is Karan, please correct me if I'm wrong. So what we wanted to show is I just wanted to show you if you like, if the team likes the less traffic and how the data is going to displaying and all then I.
I want to get into with the real data, so definitely after this call we'll after the we'll definitely incorporate things after everyone's taking everyone's feedback.
 
Reddy, Mohan S   13:57
Yeah, that's that's that's good. Tito, Robert, Maritza, I see the, you know, Gerald's on you guys. What are your first impressions? You know, we don't have to dissect the whole thing, but where do you see this fitting in?
 
Juhitha Reddy Arumalla [External]   13:59
So you know.
 
Chandrasekhar, Aruna   14:17
Maybe, you know, I could also share what we had come up with. It kind of aligns with what Gita has said, but so give me a minute to just share that.
 
Hammond, Patrick John Tito   14:30
Yeah.
 
Reddy, Mohan S   14:32
Thank you, Aruna.
 
Chandrasekhar, Aruna   14:38
OK, uh, hope everyone is able to see my desktop.
Okay. Um Let me just this out. What we start is again, we took a very simplified form because there are a lot of things this particular project has so much of data and insight, but it's important for us to take baby steps so we can keep adding and expanding.
 
Reddy, Mohan S   14:45
Yep.
 
Subramanian, Karun   14:46
Yes.
 
Chandrasekhar, Aruna   15:03
so we need to have the basic playground for it. You know Here you have the chat, which would be a placeholder. If people want to chat, they can have the chat, but you have your navigation pane here on the left side. But what importantly, first, we want to show
Is you know what is the alert level? You know This is showing every 15 minutes. The alert levels are the various what is critical, what is warning, what is minor. You have those alerts from your interlinked data. We want to show quickly as a.
snapshot, what is the level, what is leading? This will be updated every 15 minutes. Again, the time is uh what we decide. Just for the mock-up, we say 15 minutes. Then next to that, we show, Okay, you have all these alerts, but can you show me from the drop-down,
What are the critical alerts? What are the warnings? It's more like details of like how you hit the ad on the screen. You know It'll show all the dropdowns. Then we also want to show an incident tile. What are the latest incident that is going on currently? Because that information also helps the SWAT team.
Then you have this whole tile below which we call the correlation tile and for the top five alerts and in each category, maybe you know we bring out what is the top five alerts and then we try to show what are the related alerts to that.
And then once you have the related efforts, then you show what is the impacted apps and then on first level and second level, what does that mean? The impacted apps on the first level is what is directly related to the alert and the second level is and this is again maybe a placeholder at this time.
because we need more dependency information. It's something like, okay, uh let's say, for example, you know we have the eligibility service which is getting impacted, but the eligibility service also behind scene calls your claims services. So again, claims, that particular service
Could also be impacted. So you want to show these embedded levels of impact. As I said, on the first go, maybe we will not be able to do that because we have to see how the data is what we have. Do we even have that information or what more we can enrich on that?
At the first part, we would just do the impacted app level. So this is the kind of the dashboard we were thinking at the first goal that we would start with, which will give kind of some information, insight and data for the SWAT team to start working and then they can tell us.
what works, what did not work. Obviously, we would have here history tiles, which they would want to see, Okay, this last 15 minutes, you showed us this. What happened prior to that 15 minutes? What was the situation like? If they wanted to see, they can go to the history and
Should be able to pull up what was the previous 15 minutes prior to the current interval. What was the data? Same thing maybe here also. So you would definitely have a history tab which can show you that information and at any time.
you know Suppose, as we said, let's say this was updated last 15 minutes. When a SWAT team user comes here, they say, no, I want to see right now, this is past, but something's happening right now. I can see from the incident. I want to see what's happening. So then we should have a submit button here which says, hey,
Show me the current critical this table as well as what are the alerts, top five alerts kind of refresh, right? So when they click out that refresh, it goes and brings back that information and refreshes the page.
So this is the these activities are the ones which we are thinking would be on our first phase one.
 
Stadelman, Daniel R   19:29
I I think it's really good for starting. It's really good starting spot because it's not too much. It's like a it's a consumable chunk of information that would be useful and it's probably the.
You know, minimum viable product of such a system. So I I really like this.
 
Subramanian, Karun   19:51
Yeah, agreed. I think I love the the correlation tile, Aruna. Again, I keep going back to the value of this project, right? So how do we intelligently connect the dots and then service to the SRES? So the correlation tile does just that, similar to the cluster tile that Peter showed, but this one actually goes into.
 
Hammond, Patrick John Tito   19:51
You though.
 
Subramanian, Karun   20:11
Starting that the top five and then surfacing it. I really like that the correlation tile right in the middle. I think that hits you hit the actual value of this tool here.
 
Reddy, Mohan S   20:23
Yep, I I agree. Yeah, I I I do agree. Can we, you know who can we? Aruna, do you want to show another screen here or can can I just ask to pivot back to what Juvitha was showing? Because she had let's pivot back. Juvitha, take over and just show us, you know, in this context of what Aruna just.
 
Chandrasekhar, Aruna   20:36
Yeah, go ahead. Yeah. Yeah.
 
Reddy, Mohan S   20:43
Because you know, I think you've got some guidance now.
Go back to your screenshots.
 
Juhitha Reddy Arumalla [External]   20:48
Sure, sure.
 
Reddy, Mohan S   20:53
So where is that correlation? Yeah, I thought I saw it.
 
Juhitha Reddy Arumalla [External]   20:54
Oh, is.
 
Subramanian, Karun   20:57
That would be the active clusters. I'm thinking Mohan.
 
Juhitha Reddy Arumalla [External]   20:58
Yeah, that would be the active clusters, Mohan.
 
Reddy, Mohan S   21:03
OK.
 
Juhitha Reddy Arumalla [External]   21:04
So I got it. I mean from what I have seen from Arna's details, we have to add the team would like to concentrate more on that 15 minutes timeline more. We'll definitely add that in our next dashboard like next.
 
Reddy, Mohan S   21:06
Uh.
 
Juhitha Reddy Arumalla [External]   21:22
Demo.
 
Reddy, Mohan S   21:24
Yeah. Hey, by the way, let's talk about that. You know, I know we have 5 minutes, the 15 minute time period. Aruna is, should we make that a little customizable? I mean where you can you have like a slider so you can go back like a time machine to maybe an hour or maybe a couple of days to see if there were any changes.
 
Chandrasekhar, Aruna   21:44
Yeah, that that was the idea, right? And that part would be in the history because we didn't want to clutter that on the main page itself. The first page is just showing you the last 15 minutes. But if you want that to be as a slider, that that could be done. The history could be added there. You could just pull it from the.
 
Reddy, Mohan S   21:46
OK.
 
Chandrasekhar, Aruna   22:04
History tab and show it that that that's possible too.
 
Reddy, Mohan S   22:06
OK. Yep. Keep that in. OK. I just as long as there's a placeholder for that, I think it'll be good. It's like just expanding your wide angle lens. That's all it is. Yeah.
 
Juhitha Reddy Arumalla [External]   22:14
OK.
 
Chandrasekhar, Aruna   22:15
Uh huh.
 
Reddy, Mohan S   22:18
OK.
 
Chandrasekhar, Aruna   22:19
yeah It'll be more like a consolidated one which you would want to see, last 30 minutes, last 45 minutes, what happened? That gives you a little more analysis and insight. Then if you click that on the right side of it where I had shown the drop-down, it can easily pull up all the alerts for that time.
 
Reddy, Mohan S   22:31
Yep.
 
Chandrasekhar, Aruna   22:39
Interval. Those two times will be coordinated.
 
Reddy, Mohan S   22:43
OK, Yep.
 
Subramanian, Karun   22:45
And also I don't know, I'm not sure if you had this in your mock up there, the impacted services, I think there is a lot of value in that tile too. Basically we have consumed all the events and we have we are surfacing the impacted services.
 
Reddy, Mohan S   22:45
So.
 
Juhitha Reddy Arumalla [External]   22:46
Mhm.
 
Subramanian, Karun   23:00
And as per what's going on in the in the environment, this may not be the same as the current war rooms because may not we may not have found out in about a problem yet. And also my hope is this might reveal some services that are related to a current problem, right?
Uh, impacted service. So I think the impacted services, um, for someone to just go and look at it is um is a good one to have.
 
Chandrasekhar, Aruna   23:26
Mhm, Yeah. Um.
 
Subramanian, Karun   23:27
I I also, I don't expect the sorry, I don't expect anyone to just constantly babysit this dashboard. Just make making sure that you know that we all when an investigation starts, you know, I like I I that's what I'm thinking.
I think there is some proactive part to this, but if it helps with the UI, that's what I was gonna say. Nobody's gonna babysit this. So the more, you know, work that we do in the background and bring things to surface is the better.
 
Chandrasekhar, Aruna   24:00
That's exactly right, Karan. No one is going to be sitting there 24 hours. What would happen is that when a user needs the information, a wardroom or something is going on, or they may be just looking as part of their day activity. Hey, let's see how the health looks and they come to this. When they click, then they need to get that.
 
Subramanian, Karun   24:04
Yeah.
 
Chandrasekhar, Aruna   24:20
Information whatever is already being generated. So this 15 minutes and all that is happening behind scenes, right? So that data is being built up and we have to hold it. And the moment the dashboard is activated, that's when we would have an agent, right? Now we have the alert AQ agent which has.
It's got a set of workflow steps. Hey, I need to bring back this data, this data and then show it on the dashboard. That is what. So basically every what do you call invocation of a UI will automatically trigger your agent alert IQ orchestration to bring.
that information.
And it's also important to note that today it is only the dashboard maybe is using that, but there could be an instant where you have other applications wanting the same information like your correlation information, your critical, your impacted service.
So we would have to be mindful of that that that agent can be called by other applications too. So we have to position the agent in such a way that it is able to you know give the right information to the.
Whatever it is bringing back, it should know or I should say it's workflow steps has to be defined in such a way that it knows what is relevant information which goes to a dashboard call versus an application call, right? Because like in a dashboard.
If I'm refreshing, I need to know more about what is happening right now and I do not have to do all the other history stuff. I do not have to produce to the dashboard. So it's very important to know what are the elements on the dashboards are going to be. So it brings back only that relevant and.
 
Reddy, Mohan S   26:02
Yeah.
 
Chandrasekhar, Aruna   26:17
This.
doesn't run through the LLM all the time. But if it comes from an application, again, they may be asking one particular information. They may not be asking about all your clusters or correlation. They may be just wanting to know only the impact of services, so it has to be isolated. Things like that we would have to think about when we are designing
As when we do this agent, what its workflow steps would be and how we would define those workflow steps.
 
Subramanian, Karun   26:46
Yep, and also I know we are running out of time here. The all incident span here, the listing of all incidents. I think we have very many tools that show these incidents in the homepage. I I want to replace that with the correlated top.
 
Chandrasekhar, Aruna   26:58
OK.
 
Subramanian, Karun   27:03
5 busters that you had around that I think will make this stand out. So you wanna guys, what's happening here is we wanna make sure we differentiate our product with like a million incident management products that are coming out out there. So we wanna laser focus on.
 
Chandrasekhar, Aruna   27:05
It.
Yeah.
Yeah.
 
Subramanian, Karun   27:19
Getting some intelligence out of alerts, all these events and then surfacing that in the home page rather than, you know, just doing a listing of what we have already. So I I don't know if Jugita if you thought that, yeah, so we wanna in in other.
 
Chandrasekhar, Aruna   27:26
Yeah.
 
Juhitha Reddy Arumalla [External]   27:33
US.
 
Subramanian, Karun   27:36
For the active clusters, the expansion of clusters could replace the all incidents. Let definitely have a way for someone to list the incident or search for incident and all that. But that's not the main, you know the the home page. That shouldn't be in the home page.
 
Juhitha Reddy Arumalla [External]   27:51
Sure, Karan, we'll we'll focus on that and we'll replace this incident section with.
The cluster groups, top five groups like Aruna suggested.
Hello.
 
Chandrasekhar, Aruna   28:05
Yeah, OK. So we so I think some of the elements if you just decide as a as we said what we want on the first, what should be MVP. I think once you decide that then you can start on the framework and creating some of the front end services while the data is being.
 
Subramanian, Karun   28:06
Yeah.
 
Juhitha Reddy Arumalla [External]   28:07
OK.
 
Chandrasekhar, Aruna   28:25
Ready behind scenes.
 
Juhitha Reddy Arumalla [External]   28:29
Sure, sure.
 
Chandrasekhar, Aruna   28:35
OK.
 
Reddy, Mohan S   28:35
Alright, cool. Thanks.
 
Juhitha Reddy Arumalla [External]   28:39
Thanks, Mohan. Thanks, Aruna. Thanks, Karan. Thanks, everyone. Thanks.
 
Reddy, Mohan S   28:40
Yep. Thank you, folks.
 
Chandrasekhar, Aruna   28:40
Yeah. Thank you, folks. Talk to you all soon.
 
Pathak, Abhishek   28:42
Thank you.
 
Agrawal, Mayurika stopped transcription