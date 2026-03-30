Agrawal, Mayurika started transcription
 
Agrawal, Mayurika   0:03
We have a discussion in our last meeting regarding the mock UI. So there were feedback given by Karuna, Aruna and Mohan. So those feedback has been incorporated and we are ready with another design for a mock UI. So Juhita, you can go ahead and share the updated version of the mock UIs.
 
Reddy, Mohan S   0:19
Yes.
 
Juhitha Reddy Arumalla [External]   0:20
Thanks, Marika. Let me share the screen.
Uh, hope everyone can see my screen now.
 
Reddy, Mohan S   0:31
Yeah. Yes, thanks.
 
Juhitha Reddy Arumalla [External]   0:32
OK, so after taking the feedback, everyone's feedback, we came up with the third version. So here let me start with the Alert IQ dashboard, this which provides real time AI group alerts, influence and gives a QQ of clusters, alerts and impacted services.
Across the environment. So usually we are like we have the top key metrics here which is active clusters, number of critical alerts and number of impacted services. This gives operators an immediate understanding of system health and operational risk on the like alert window.
We have alert overview panel which categorize alerts by severity levels such as critical, warning, minor, unclear. This allows team to quickly identify the distribution of alert severity and prioritize the investigations. The system continuously update this view based on the selected time interval window which.
This case is set to be 15 minutes. Coming to the impacted services, on the right side we have the Impacted Services panel which shows which services are currently affected by alerts. For each service we have the severity level and the number of incidents associated with it. This helps teams quickly identify which services are under stress and require attention.
Coming to the incident and alert details we have, we can see individual alert categories such as critical alerts, warnings, alerts and minor alerts also. So these alerts are basically grouped into the like incidents making it easier to investigate related issues.
Choosing of analyzing each alert individually. So on the right side we have the find incident panel where we operators can search inside by either giving the name, ID or service. So one of the key improvements in this version is the AI based correlation engine, the system automatically groups.
Alert related alerts into the alert clusters helping identify like potential root causes faster. For example this this this cluster shows load balancer health check failures on the system register the related alerts on directly impacted services.
This helps teams like immediately understand how like how a failure propagates across different services. Yeah, these are the file alert cluster like example cluster we wanted to show.
Coming to the history panel we have, we can see the total incidents and resolved incident in the past hour and which is the most impacted services.
These are few recurring services.
I'm coming to the resolution log. So in the resolution log we track how incidents were resolved on on what actions have been taken like this. We are seeing here for example the DNS resolution latency incident. This is the resolution log happened.
And it will just it is also showing the priority and the time here.
Coming to the investigation, this is the this is pretty much same from the last time which is like if you can open an incident we can see the AI generated summary and the system analyzes the alert signals and provides a hypothesis of most likely root cause with confidence scoring.
This timeline and blashes, we didn't change anything. They are pretty much the same.
Yeah, this is the topology where there is a drop down for each ID and we can see which services are getting affected and how many are impacted and how many are healthy.
Coming to the trays where we can discuss about each incident by searching it's by searching the incident by name or IDs.
 
Reddy, Mohan S   4:29
So.
 
Juhitha Reddy Arumalla [External]   4:31
So we are open for the comments and feedback.
 
Reddy, Mohan S   4:41
Jurita, thank you. Yep. Can you can you guys hear me? Yeah.
 
Juhitha Reddy Arumalla [External]   4:44
Yeah, yeah, we can hear him.
 
Reddy, Mohan S   4:47
Uh, do you mind if I jump in there first, Colin Aruna?
 
Juhitha Reddy Arumalla [External]   4:52
Uh huh.
 
Chandrasekhar, Aruna   4:52
Sure, Go ahead.
 
Reddy, Mohan S   4:53
OK, yeah, yeah, yeah. So I'm gonna just jump in top of mind. How how are you generating the topology? Is it is it also this is this dynamically generated?
 
Juhitha Reddy Arumalla [External]   5:07
Yeah.
 
Reddy, Mohan S   5:07
Very good. OK.
OK. So the plan is your correlation logic and you know basically your LLM interactions, whatever you're doing will will has the ability to generate that topology that that can be very powerful, yes.
 
Juhitha Reddy Arumalla [External]   5:16
Uhhuh.
 
Reddy, Mohan S   5:26
Uh.
And then go go to the triage tab. The last one please.
Let me understand this a little bit. Yeah. So, Jurita, I think I was trying to, you know, keep up with you there. So what's the, what's the main benefit here? Conversational triage.
 
Juhitha Reddy Arumalla [External]   5:38
This one? Yeah. Yeah.
Uh.
 
Reddy, Mohan S   5:52
Oh, oh, so you can you can free form. So I see you. You've got a natural language interface here. OK.
 
Juhitha Reddy Arumalla [External]   5:54
Yeah, yeah, yeah, yeah.
 
Reddy, Mohan S   5:58
And then what is the OK and the history? I I I suppose. What does the history show really?
 
Juhitha Reddy Arumalla [External]   5:58
Where we go?
So I'm sorry here I I didn't like, we don't have anything because I didn't really search anything. So so yeah, yeah, so from the user's perspective, So what if like I want to deal with some alert one and that was done and I jumped into alert two. Now I want to see what happened, like what did I deal with?
 
Reddy, Mohan S   6:09
OK, that's fine. Understood. Yeah.
Yeah.
 
Juhitha Reddy Arumalla [External]   6:24
With alert one so I can see it in the history what what what I have chatted with the chatbot and what exactly answers it was giving me. Yeah, I can see that here.
 
Reddy, Mohan S   6:31
OK, Yep, Yep, that makes sense. Yeah, we can see how that can be useful.
OK. And then you should go back to investigation for a second.
OK. So there's an AI summary. OK, very good. And then with the, so some hypotheses with some confidence scoring, that's all straightforward alternative hypotheses.
OK. And that's it, right? That's a summary and hypothesis. That's that's exactly how it should be.
And then it's it's it's it's grouped by incident. So each incident will generate this. What happens? I mean, is it? How does this get triggered? Yeah, I I believe it comes from the incidents, right? With an ID there.
 
Juhitha Reddy Arumalla [External]   7:26
Right, right.
 
Reddy, Mohan S   7:28
OK.
I think, yeah, Karun Aruna and I see Gary joined. Hey, listen, I I think we should, we should start, you know, getting fuel into the system and see how it functions. I I I like the interface. I mean, I I really we can, we can keep on perfecting it, but then there's no end insight for that.
What do you guys think?
 
Chandrasekhar, Aruna   8:03
Jahita, can you go to the main dashboard please, the first one?
 
Juhitha Reddy Arumalla [External]   8:06
The flash screen, OK.
 
Chandrasekhar, Aruna   8:08
Yeah. So you you have the alert level, which is what we wanted, you know, which shows all the various levels of whether it is critical warning and this is the events that is happening, right? And remember
 
Juhitha Reddy Arumalla [External]   8:26
Mhm.
 
Chandrasekhar, Aruna   8:28
this would have that is interval is and when it was last update. Obviously you would, you know instead of saying last up 18 minutes, it's very difficult for people to know um you know what is last 18 minutes. So you would actually give the time and the date so that it's very clear for
 
Juhitha Reddy Arumalla [External]   8:36
Yeah.
 
Chandrasekhar, Aruna   8:47
Well, when it was last updated at 10:29, it was updated at 9:15, right? So that's how you would give, but that that's just a cosmetic change for the thing. And then here is where.
 
Juhitha Reddy Arumalla [External]   8:50
Oh.
Yeah.
Sure, sure, sure, sure. Yeah, I'll definitely update that, yeah.
 
Chandrasekhar, Aruna   9:04
So what I see on the dashboard kind of captured the information we want, but I still don't. I'm not very, let's say with the layout, I think we need to do a little more.
um adjustments so that it is easy for folks to navigate, right? And one of the other things that remember Mohan had asked last time that he would want to see
 
Juhitha Reddy Arumalla [External]   9:27
Uh huh.
 
Chandrasekhar, Aruna   9:36
In a scroll bar of the last 15 minutes, what happened and now what's the alert? So that scroller should also be available, I think in all the ties on the critical impacted, if not on all, maybe we start at least with the details.
 
Juhitha Reddy Arumalla [External]   9:54
Mhm.
Mhm.
 
Chandrasekhar, Aruna   10:16
I don't want to switch the screen at that point. I don't want to go to history and find out. It's on the same way where the last 15 minutes is shown. More details of it can always come in the history. Um The impacted services, what is the impacted services? This is from your correlation.
 
Juhitha Reddy Arumalla [External]   10:23
OK.
 
Chandrasekhar, Aruna   10:36
Information, right?
 
Juhitha Reddy Arumalla [External]   10:38
Right.
Yeah, this is from the correlation information.
 
Reddy, Mohan S   10:41
Yep, Yep.
 
Chandrasekhar, Aruna   10:41
5.
So it it OK so.
 
Reddy, Mohan S   10:48
So this would be in services identified by ID, I suppose. Aruna, Aruna, you see that scroll bar up right top. She's got live, you know, she's got four choices there. Yeah, it's it's it's not exactly a slider, but you know, it's still you can go back. I suppose we can adjust the time frames. Yeah, yeah, yeah, yeah, she's got him up there.
 
Juhitha Reddy Arumalla [External]   10:59
A filtered.
 
Chandrasekhar, Aruna   11:03
OK. OK. I I didn't see that part on the live 15 minutes for the sheets got that on the top, yeah.
 
Juhitha Reddy Arumalla [External]   11:09
Or Aruna please. I'm so sorry to interrupt. Also we can add. I mean this is just my thought. Please correct me if I'm wrong here. So also we can add a drop down if that is OK with everyone like 15 minutes, 30 minutes, 45 minutes and 60 minutes if that is OK with everyone. I I I just said that.
 
Reddy, Mohan S   11:10
Yep.
 
Chandrasekhar, Aruna   11:26
That's fine to see the drop. Those are all cosmetic exchanges as we think. I just want to see first where. As I said, you captured the details that we had talked about, but um I'm still not very comfortable with the actual layout, the way you.
 
Reddy, Mohan S   11:28
That's fine.
 
Juhitha Reddy Arumalla [External]   11:29
Mm-hmm.
 
Reddy, Mohan S   11:32
Yes, yes.
 
Juhitha Reddy Arumalla [External]   11:32
Uh huh.
 
Chandrasekhar, Aruna   11:46
Would see.
It on the board because there's a lot of scrolling up and down which you do not want to do, right? So I think one of the things like this active cluster, you're taking space there. Maybe that is something we don't really need to show so big. We could probably show it along with the alert or in a different way with this.
 
Juhitha Reddy Arumalla [External]   11:52
Uh huh.
 
Chandrasekhar, Aruna   12:07
so much of space. As I said, it's more on the layout that I am now looking because you you captured the information that we want. Um Again, the service impact is on these alerts, what are the... If you click on critical, I should get all the critical services which is
me the alert. And then you have the alert details somewhere going down uh you know on the lower side. Scroll down, please. And And that's why I said there's a lot of hops from here. And then you have an incident, again, you're jumping. It It has to cut
 
Juhitha Reddy Arumalla [External]   12:42
Right.
 
Chandrasekhar, Aruna   12:46
Kind of tell the story here also so that for a user it is very intuitive when they see the screen and go about that and then you have Scroll down, you have the correlation top alert.
Right. And these are what are the alerts? OK, Scroll down. So what is this is giving you the what? What is all that load balancer API service? What is that?
 
Juhitha Reddy Arumalla [External]   13:03
Mhm.
Oh, these are just examples, but we we just wanted to show the top five clusters we are dealing as of now as Tarun suggested last time. That is what we wanted to show.
 
Chandrasekhar, Aruna   13:19
Uh.
Yeah, we are showing the live, but that'll be part of this, right? And that's why I'm saying there are little too many details as well as things. It has to become little more comprehensive as you know when you're when you're working on the remember who is the user, it is the SWAT team.
 
Juhitha Reddy Arumalla [External]   13:33
Uh huh.
 
Chandrasekhar, Aruna   13:40
They do not have too much time to be going here and there while they're navigating. They need information quickly, right? So we have to give them a facility where the navigation is simple and intuitive for them to pick it up. Going to different tabs, ohh it is here, it is there. That is a lot of
Time for them. So it is from that perspective how we would have to arrange the types.
 
Juhitha Reddy Arumalla [External]   14:06
So, yeah.
 
Reddy, Mohan S   14:06
I I agree.
 
Chandrasekhar, Aruna   14:06
So I think we you're you're there almost I would say we are there 75%. The 25% is where the layout has been much more cleaner that that is what I think.
 
Juhitha Reddy Arumalla [External]   14:11
Mhm.
 
Reddy, Mohan S   14:17
You know, Yep, let me let me just add something here, Johita. Just give me one second. Absolutely. You know what Aruna, Aruna just reminded us, right? Think of it this way. Look at it from my lens, my team, right? Because we are, we are your first customers.
 
Juhitha Reddy Arumalla [External]   14:17
Oh, yeah.
Yeah.
Uh huh. Yeah, good. Yeah.
 
Reddy, Mohan S   14:33
All right, look at this. We are going to come in with a fairly narrow lens as far as we know something's happening, right? We're entering the system because something's happening. We're not just saying that we're not monitoring stuff. We're not. We don't do that job function. We get involved when when things start.
 
Juhitha Reddy Arumalla [External]   14:45
Yeah.
 
Reddy, Mohan S   14:49
You know going bad so so we come in with with with a focus already. So I think I think you are you know this this is a workable UI design you know where we can we can tweak a few things to Aruna's point you know in terms of you know how you present it so you.
Keep our attention because like she said, the last thing we wanna do is be jumping around too much on the UI, which I think it's gonna take us some practice here. So how can we get real data?
 
Juhitha Reddy Arumalla [External]   15:16
Mhm.
 
Ross, Gary L   15:20
Oh.
 
Reddy, Mohan S   15:24
I'm looking, I'm thinking ahead a little bit. You know, we we need to be able to go through some live data and then see how the team reacts to what we're seeing on this UI. We got to do that fast, I think. Yeah, fast meaning, you know, we we need to know when we can do that.
 
Juhitha Reddy Arumalla [External]   15:35
Sure.
 
Chandrasekhar, Aruna   15:41
Yeah, and most of the items should be clickable for that so they do not have to jump to a different screen. So they click, either it pops up on a different window or it just shows them the highlight of it. And so they can immediately close that window and navigate away from the screen. So things like that. So I think the now.
 
Reddy, Mohan S   15:45
Yeah.
 
Chandrasekhar, Aruna   16:01
that we know what are the details I think we have captured. I think the focus should be on how we do the UI layout better. Does that help you, Juhitha?
 
Juhitha Reddy Arumalla [External]   16:10
Uh oh oh.
 
Reddy, Mohan S   16:10
Yep.
 
Juhitha Reddy Arumalla [External]   16:12
Yeah, that does. Thank you so much, Aruna. But I just want to confirm one thing. So the like the tabs, the like the number of tabs are fine, right? Or should we start from there?
 
Chandrasekhar, Aruna   16:30
No, you're on the main screen. It's a forget on the left side that this black navigation bar, we can add that later because those can be same as this. First we have to concentrate on your main dashboard. OK, so that is your home, right? So home would be your dashboard.
 
Juhitha Reddy Arumalla [External]   16:30
Yeah, yeah, yeah, yeah, yeah, yeah. These. Correct, correct, correct.
 
Reddy, Mohan S   16:31
It's fine.
 
Juhitha Reddy Arumalla [External]   16:37
OK.
Uh huh.
 
Chandrasekhar, Aruna   16:48
Then we start from there. What is it that they want to see? What did they want to click here? Um Then things like your root cause analysis, I don't think we need to worry too much because remember we already have an RCA genie. Remember Karun had mentioned that.
We will see if we can just integrate with that to get all the information because you are still getting it from the incidents and then running an AI on top of that. Uh you know Can we reduce our AI here and just call the genie because that genie is also doing the same thing. The triage
Part of it, the root cause analysis, let's not worry too much because that we know that feature is there. If we cannot integrate it, we can do that. But the first important thing is for us to get this layout for them to give them the information what is trending as your alerts.
 
Reddy, Mohan S   17:32
Hello.
Yes.
 
Chandrasekhar, Aruna   17:48
Right. And what do we think is can kind of become, what do you call get into the danger or critical zone. And then we want to see what are those critical ones where we are finding the relationship. Impacted services is one part of it, but the.
The most important feature of this tile, when I see, I should immediately see after that the correlation information. To go that you have to scroll so much down that should be more prominent, right? And that's why we're saying all these will be smaller tiles which is there, but your main information is correlation.
 
Reddy, Mohan S   18:15
Yeah.
 
Juhitha Reddy Arumalla [External]   18:19
Oh.
 
Chandrasekhar, Aruna   18:28
That should stand out more easily for them. They know the alerts and hey, well, these are the alerts going. The next question is, okay, is there a relation here? Let me look at it. What is the correlation? They jump into that. We have to put on the SWAT hat and see how we do it. That's why we have the team here also to help us say what
That they would do, right? So as I said, my feedback to you is we need to do a better job on the UI, shape it a little more better so that it is more a better user experience for the team.
 
Juhitha Reddy Arumalla [External]   19:04
Sure, Aruna. I will definitely work on the layout next time.
 
Reddy, Mohan S   19:09
Yep. And and quickly, just, you know, 10 minutes here. Gary, question.
 
Juhitha Reddy Arumalla [External]   19:09
Oh, yeah.
 
Ross, Gary L   19:16
Yeah, regarding the layout, I mean, Aruna is completely correct if we could get more of the stuff towards the top. But what I'm noticing here is the resolution that's being shown here is very, very small. We typically run at, you know, it looks like this is almost like 800 by 600.
Most of us run at a higher resolution, so we're gonna have more. We'd end up with more real estate on the browser.
 
Reddy, Mohan S   19:36
Yeah, I just maybe it's a mock up. Yep.
 
Juhitha Reddy Arumalla [External]   19:37
Um.
 
Reddy, Mohan S   19:43
You're saying we can handle more information or, you know, a little more density?
 
Ross, Gary L   19:47
Right, cause what's being presented, it looks great, but it's just it's you're you're kind of putting yourself into a smaller box than what we typically run at. We typically run. I mean right now I'm running at 4K, so my stuff is running at 3840 by like 2900.
 
Reddy, Mohan S   19:52
Yeah, it's.
Yep. We've got a lot of real estate on. Oh, yeah.
 
Ross, Gary L   20:04
So we have, we have way more real estate that you can use that you can spread out more.
 
Reddy, Mohan S   20:25
Yeah.
 
Ross, Gary L   20:26
Real estate just to put information. I just don't want everyone to think it should be confined to such a small space. Does that make sense?
 
Juhitha Reddy Arumalla [External]   20:36
That does. Thanks. So I mean right now this is the initial layout, but we can definitely adjust this resolution log by maybe adding the drop down or you know if we have more coming up, more density coming up.
 
Reddy, Mohan S   20:50
Yeah. Hey, you know what? Yep, you got it. Where is the. So you're drawing from, you know what? What I didn't see today is any reference to any changes. Did I miss it? I mean, like in the correlation clusters, wherever, are you going to call out changes? Because those are our number one offenders.
 
Juhitha Reddy Arumalla [External]   20:50
That is idea.
 
Reddy, Mohan S   21:09
You know, most of our P ones are caused by changes.
You know, if you know if just this is a reminder to folks, I mean maybe I shouldn't say most, but a good fraction of the P ones are caused by changes and that's that's the lowest hanging fruit you can ever imagine, right? I mean if correlation to a change.
 
Juhitha Reddy Arumalla [External]   21:26
Yeah.
 
Reddy, Mohan S   21:28
Should should be jumping out of this board. So you know, take that as feedback also somewhere. I I think you already have it. Maybe I've missed it, but yeah, we need, we need, you know, because that is that that is the most actionable thing I one would argue, right? I mean, there's nothing more actionable than rolling back a change.
 
Juhitha Reddy Arumalla [External]   21:33
Oh, sure, sure.
So, you know.
 
Subramanian, Karun   21:46
So Mohan, on that, I mean because we were going after interlink data, right? Interlink itself does not have the change information, it has to come from ServiceNow. That is probably gonna increase the scope a little bit, but you're 100% right, you know, thinking about resolution that comes.
 
Reddy, Mohan S   21:52
Yeah.
Regarding.
Right.
 
Subramanian, Karun   22:06
That's one of the top things we need to look at. So RCA Genie does some of, well actually a lot of crunching of those data. Perhaps what we can do is depends on the failed service. This should make an API call out to RCA Genie and then bring that result here and that actually does show potential changes that could.
 
Reddy, Mohan S   22:14
Yeah.
 
Subramanian, Karun   22:25
Could be causing this incident. It it started the incident though.
 
Reddy, Mohan S   22:27
Oh, yeah, yeah. Yep. That'll be good. That'll be fantastic. Karun, that's a great idea. In fact, you know, the other thing Karun is Aruna, you know, it's, I know from a leadership perspective, we know that there's 345 efforts very, very similar going on right now.
 
Ross, Gary L   22:29
That'd be fantastic, yeah.
 
Subramanian, Karun   22:31
Yep.
 
Ross, Gary L   22:35
Excellent.
 
Subramanian, Karun   22:46
Yes. Mm-hmm. Yeah, that's why I wanna keep focusing on the alert intelligence in this one, because no, no one else is doing this alert intelligence piece. Um.
 
Reddy, Mohan S   22:47
You know, I don't know how to to balance. That is the dance.
Yeah, maybe that's what we should just OK.
 
Subramanian, Karun   22:58
Right. And I'll since I have the microphone here, just a couple of feedback on the UI, right? 100% agree with the all the feedback so far. I'm gonna ask one thing Juhitha from your side is to, you know, create a document. It could. It doesn't have to be detailed of each of these panels.
And what they do with the description, right. I want, you know, folks like Tito and others in offline and even for us to digest this information a little bit more. I'm pretty sure Dan would want that too, because a lot of what we see in the UI will drive how we want to layout the data on the data source side.
 
Juhitha Reddy Arumalla [External]   23:24
2.
 
Subramanian, Karun   23:35
Right, so my request is for each of these panel, you know, just have a screenshot of the panel and what it does. A description as a document doesn't have to be today, but but by Monday if we can have that, we'll know exactly what the product is doing.
 
Juhitha Reddy Arumalla [External]   23:53
Sure, definitely Karun. So yeah, one more thing Karun, can I just do it or can we do it after updating this layout after what Aruna have suggested?
 
Subramanian, Karun   23:54
That that's.
Yeah, yeah, absolutely. You can update it. You can update it based on the feedback so that you know it's it's current, but definitely do that because this is not accessible by us, right? This is, it looks like it's your in your environment. So let's have that piece of information for us to proceed and then on the layout itself.
 
Juhitha Reddy Arumalla [External]   24:11
Yeah.
Yeah, I.
 
Subramanian, Karun   24:20
You know, if you scroll all the way up again, the real estate is important here and we want to only surface the most useful data. So go to dashboard and go all the way up. For instance, I'm looking at the critical alerts that's enter big block, right? I mean that that is standing out, but again, whether it's 10.
2030 hundred What are we gonna do with this? This simply going showing the number of critical alerts out there. What I'm thinking is the active clusters is super useful. To Aruna's point, that's the meat of this product to automatically use A to group these related events and then show the clusters.
That to me, it should definitely come up into the middle panel, right? You know you don't have to Scroll down to look at the details of the active cluster and also have I believe we have some flexibility to move this around once we go into once we start ingesting real time data, right? So it's not like set in stone.
 
Reddy, Mohan S   25:18
8.
 
Subramanian, Karun   25:18
So the critical alerts tile and then if you look at the alert tile that simply breaks down critical warning, minor clear and error. I also don't see a lot of immediate value from there if let's say right.
 
Juhitha Reddy Arumalla [External]   25:33
Mhm.
 
Subramanian, Karun   25:33
We what we can do is to make these tiles smaller and then perhaps show it at the top right so it's still there, but doesn't take up a lot of real estate. So that's something I want you to consider these big tiles. Unless these are like absolutely smoking guns, we don't wanna show it as a big, big tile.
That said, impacted services is still good. Go ahead.
 
Chandrasekhar, Aruna   25:55
Karun, in fact, just a minute. I was thinking that whole line, right, the active critical and we don't need that at all because you already have this main tiles, you can have the number posted on that directly.
 
Subramanian, Karun   26:01
Mhm.
 
Ross, Gary L   26:10
Exactly.
 
Chandrasekhar, Aruna   26:10
Because what? What are you going to do with those three tiles, right?
 
Subramanian, Karun   26:10
Yeah, right. Go again.
 
Juhitha Reddy Arumalla [External]   26:11
No.
Right, right, Aaron. Yeah.
 
Ross, Gary L   26:15
And clear and error have no meaning to us. We'll we'll completely ignore those if that's just a waste.
 
Subramanian, Karun   26:20
Exactly. Yep. So I would say right away that breakdown of the alerts panel, the alert level, we can just simply remove it. I mean, but I know we have data, so down the line if we have to show as a part of a drill down our history, we can, but it that doesn't belong in the home page.
 
Juhitha Reddy Arumalla [External]   26:21
Mhm.
 
Subramanian, Karun   26:41
Impacted Services is awesome. I think I'm almost thinking impacted services and the clustering are the two major value of this impacted services. It looks at you know for a given service how many alerts are going on and then it brings it to the surface.
Right, that one. And then the the the correlated, the active clusters definitely should should be prominent.
 
Reddy, Mohan S   27:03
Yeah.
Yes, 100%. I think the cluster, the cluster alert, you've introduced a new dimension. I mean you at least you can claim that you know we're introducing a new dimension that's that's unique. I agree clustered alerts.
 
Juhitha Reddy Arumalla [External]   27:05
Sure.
 
Chandrasekhar, Aruna   27:06
Yeah.
 
Subramanian, Karun   27:15
Exactly.
 
Chandrasekhar, Aruna   27:16
And by changing the, I'm sorry, now just going to say that by changing the layout of the impact service, you have critical high on as on the top and all the services down. If you switch that you're you'll get more real estate right there.
 
Juhitha Reddy Arumalla [External]   27:17
So up.
 
Subramanian, Karun   27:17
Yeah, all other tools that we go ahead, sorry.
 
Reddy, Mohan S   27:20
Yep.
 
Chandrasekhar, Aruna   27:33
And that's what I had shown in my you know earlier how how it would be displayed because then you can always do drop down and Click to further details. You will you don't have to display all your five services right there.
 
Juhitha Reddy Arumalla [External]   27:48
Uh-huh. So.
 
Chandrasekhar, Aruna   27:49
Yeah, once you have the tiles, you have a lot of things to change around. You could do that. And one more thing I would also say when you're creating this, each of these tiles you should keep it so independent that you can give people customized option to switch the tiles what they want to see.
 
Reddy, Mohan S   27:50
Yeah.
 
Chandrasekhar, Aruna   28:09
Maybe Mohan wants to see only the alert and the number of impacted service, but Tito, when he comes, he wants to see the details of alert details or Gary wants to see the correlation to be the top tile. So the tiles can be adjusted and moved according to their customization and that I found was very useful for.
Of users because what Mohan sees is not what same as what Gary sees.
 
Juhitha Reddy Arumalla [External]   28:36
Sure, Aruna. So I'm making sure that everyone is aligned on this. So we don't want to see these three panels, right?
 
Chandrasekhar, Aruna   28:45
Yeah, we don't want that panel. I think we removed the panel, but we need the number somewhere on your tile which you put. You need to put that promptly so they know the value of that particular tile.
 
Juhitha Reddy Arumalla [External]   28:47
OK, OK.
Oh, OK. OK. Got it. Aruna. Yeah.
 
Subramanian, Karun   29:06
And I know we didn't dig deep into history, investigation and topology. I know you showed and triage. I'm almost thinking that can be combined. Investigation and triage seems to be redundant there.
 
Juhitha Reddy Arumalla [External]   29:07
Well.
 
Chandrasekhar, Aruna   29:07
Uh.
Mhm, mhm.
 
Subramanian, Karun   29:21
Right. So they mean the same thing. I would say just for active drill down troubleshooting, we can have one screen as investigation. And again keeping in mind that let's not do the full blown RCA here. Let's see how it how this evolves with with by correlating and then.
Bringing all the important alerts to surface, I'm thinking we'll have a better idea of where this goes down the line, but we cannot be jumping into RCA at this level. The problem is, I mean, it looks great in UI, but if it's not gonna be reliable, people will lose trust, right?
 
Reddy, Mohan S   29:44
It.
 
Juhitha Reddy Arumalla [External]   29:47
Oh.
 
Chandrasekhar, Aruna   29:56
Yeah, exactly. Yep. Yeah.
 
Reddy, Mohan S   29:56
Yeah, yeah, agreed. Yeah, we can lower the expectations in RCA. No question about it. Yep. And you're right, Karun. You know, we've got other tools addressing that too, so.
 
Juhitha Reddy Arumalla [External]   30:00
Oh.
 
Subramanian, Karun   30:08
Yeah, again, bring the focus back to what kind of AI intelligence can we use AI in in the based on what we get from interlink, right. So that's the goal. Think about I was maybe I suggested something like a notable events.
 
Juhitha Reddy Arumalla [External]   30:08
Yeah, so.
 
Subramanian, Karun   30:24
Right. I don't wanna muddy the water here, but that's something I think about. You know, we have these thousands of events coming in. What is interesting and that is that AA should be able to tell us what's interesting versus we have to, you know, look at everything.
Don't jump onto that, but that's the line of thinking I wanna have right to see what we can do with the AI interlink.
 
Chandrasekhar, Aruna   30:48
Everyone, I need to jump off to another call. You know, we could be there. Thank you everyone.
 
Reddy, Mohan S   30:49
Yeah.
****.
 
Subramanian, Karun   30:52
Yeah, same here.
 
Reddy, Mohan S   30:53
Yeah, you got it. Yeah. Yeah, go ahead, Juta. Yeah, I have a minute. Yes, I can stick around.
 
Juhitha Reddy Arumalla [External]   30:54
Mohan, Mohan, do you have a minute? Yeah, I I would like to know how you like this filter section. I'm sorry I didn't show it before. I'm so sorry for taking a minute.
 
Reddy, Mohan S   31:06
Yeah.
 
Juhitha Reddy Arumalla [External]   31:07
Yeah.
I mean these are the filters we, I mean we just have added the severity, the status and time range. So I just want to know how you guys liked it so that.
 
Reddy, Mohan S   31:15
Yeah, you know, as Gary said, right, we're only interested in, yeah, you, you know, the criticals and the highs, severity, mediums. Yeah, that's good. So you've got this and status active. I'm not even sure where are you getting the status from?
 
Subramanian, Karun   31:25
Yep.
 
Juhitha Reddy Arumalla [External]   31:34
We'll get it from the interlink data itself, Mohan.
 
Reddy, Mohan S   31:37
OK. And then this is by incidence by this is by incidence I see. OK, are we OK? First of all, are we noting an incident's resolved and all that? Yeah, we got to go back and check all that, but that's OK overall. I mean, you know, from a from a general perspective, this looks fine.
 
Juhitha Reddy Arumalla [External]   31:41
Yeah, yeah.
Mhm.
 
Reddy, Mohan S   31:53
You know, I think we talked about a slider, but this is good enough. You know, this will work. Yep.
 
Juhitha Reddy Arumalla [External]   31:56
Sure, sure, sure. Thanks. Thanks, everyone. Thanks, Karun. Thanks, Mohan. Oh, oh, please, please.
 
Ross, Gary L   31:58
Right up.
 
Reddy, Mohan S   32:00
Wait, wait, wait. Gary's got out. Yeah, Gary, what would you say?
 
Ross, Gary L   32:02
No, I just, I was just saying on the on the time range, I was just do we really need to go back 30 days? I mean 70 even seems excessive. I mean typically we're just day-to-day, but I want to be able to give us some historical going back seven days.
 
Reddy, Mohan S   32:15
You know.
 
Ross, Gary L   32:17
I don't know if that would help save time on doing searches.
 
Reddy, Mohan S   32:18
Let's think about that, Gary. Let's, yeah, yeah, let's, you know, that's fine. You know, we'll definitely have a discussion about it. Yeah, because you're, I don't want to take, yeah, you're right. We don't want anything to take away from this, from the, you know, the acute focus we have to maintain during the event, right, to resolve it.
 
Adapa, Kalapana   32:21
OK.
 
Ross, Gary L   32:24
OK, OK.
Yep.
Exactly. Keep it micro versus macro.
 
Reddy, Mohan S   32:34
I I I agree. We don't want the distractions and I I will discuss it, but I I, you know, for now, that's fine. Yeah, OK.
 
Ross, Gary L   32:38
OK, perfect. Thank you.
 
Juhitha Reddy Arumalla [External]   32:40
Sure, sure. Thanks, everyone. Thanks. Thanks. Thanks, Karun. Thanks, Mohan. Thanks, Larry. Bye.
 
Reddy, Mohan S   32:42
Yeah, we'll catch up on the next one. Thank you. Thank you.
 
Adapa, Kalapana   32:43
OK.
 
Subramanian, Karun   32:45
Thank you all.
 
Juhitha Reddy Arumalla [External]   32:48
Thanks.