import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const C = {
  bg: '#0B100E', panel: '#141C18', panel2: '#1C2821', line: '#2B3A30',
  green: '#B7F36B', green2: '#7FCB45', white: '#F5F8F4', muted: '#9AA99F',
  orange: '#FFBD72', red: '#FF827B'
};
const FOOD = [
  { id:'egg', name:'Boiled eggs', serving:'2 large', kcal:156, protein:12.6, category:'Non-veg', icon:'🥚' },
  { id:'paneer', name:'Paneer', serving:'100 g', kcal:265, protein:18, category:'Veg', icon:'🧀' },
  { id:'dal', name:'Dal', serving:'1 bowl', kcal:170, protein:9, category:'Veg', icon:'🥣' },
  { id:'chicken', name:'Chicken breast', serving:'100 g cooked', kcal:165, protein:31, category:'Non-veg', icon:'🍗' },
  { id:'milk', name:'Milk', serving:'250 ml', kcal:150, protein:8, category:'Veg', icon:'🥛' },
  { id:'curd', name:'Curd', serving:'150 g', kcal:95, protein:5, category:'Veg', icon:'🥣' },
  { id:'chana', name:'Roasted chana', serving:'50 g', kcal:190, protein:10, category:'Veg', icon:'🫘' },
  { id:'rice', name:'Cooked rice', serving:'1 cup', kcal:205, protein:4.3, category:'Veg', icon:'🍚' },
  { id:'roti', name:'Roti', serving:'1 medium', kcal:110, protein:3, category:'Veg', icon:'🫓' },
  { id:'oats', name:'Oats', serving:'50 g dry', kcal:190, protein:6.5, category:'Veg', icon:'🥣' },
  { id:'tofu', name:'Tofu', serving:'100 g', kcal:145, protein:16, category:'Veg', icon:'🧊' },
  { id:'banana', name:'Banana', serving:'1 medium', kcal:105, protein:1.3, category:'Veg', icon:'🍌' }
];
const MEALS = [
  {time:'BREAKFAST', title:'Power oats bowl', desc:'Oats + milk + banana + 2 eggs or tofu', kcal:430, protein:24, tag:'Easy start'},
  {time:'LUNCH', title:'Indian strength plate', desc:'Roti or rice + dal + vegetables + paneer/chicken', kcal:620, protein:32, tag:'Balanced'},
  {time:'SNACK', title:'Pre-workout fuel', desc:'Banana + curd or roasted chana', kcal:250, protein:10, tag:'Workout fuel'},
  {time:'DINNER', title:'Recovery dinner', desc:'Rice/roti + vegetables + dal + paneer/eggs/chicken', kcal:580, protein:35, tag:'Recovery'}
];
const WORKOUTS = [
  {day:'DAY 01', name:'Push', sub:'Chest · Shoulders · Triceps', moves:['Bench press — 3 × 8–12','Incline dumbbell press — 3 × 10','Shoulder press — 3 × 10','Lateral raises — 3 × 12–15','Triceps pushdown — 3 × 12']},
  {day:'DAY 02', name:'Pull', sub:'Back · Biceps', moves:['Lat pulldown — 3 × 10','Seated cable row — 3 × 10','One-arm dumbbell row — 3 × 10 each','Face pulls — 3 × 15','Dumbbell curls — 3 × 12']},
  {day:'DAY 03', name:'Legs + Core', sub:'Quads · Hamstrings · Glutes', moves:['Goblet squat — 3 × 10','Romanian deadlift — 3 × 10','Leg press — 3 × 12','Calf raises — 3 × 15','Plank — 3 × 30–45 sec']},
  {day:'DAY 04', name:'Active recovery', sub:'Mobility · Light cardio', moves:['Easy walk — 20 minutes','Hip and shoulder mobility — 10 minutes','Gentle stretching — 5 minutes']}
];
const todayKey = () => new Date().toISOString().slice(0,10);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [tab, setTab] = useState('Home');
  const [goals, setGoals] = useState({cal:2200, protein:120, weight:70, goal:'Muscle gain', diet:'Both'});
  const [foodLog, setFoodLog] = useState([]);
  const [weights, setWeights] = useState([{date:todayKey(), weight:70}]);
  const [weightInput, setWeightInput] = useState('70');
  const [chatInput, setChatInput] = useState('');
  const [chat, setChat] = useState([{from:'ai', text:'Hey! I’m your FitFuel guide. Ask me about Indian meal ideas, protein-rich foods, or how to structure your workout. I provide general guidance, not medical advice.'}]);
  const [workoutDone, setWorkoutDone] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('fitfuel-v1');
        if (raw) {
          const d = JSON.parse(raw);
          setUser(d.user || null); setGoals(d.goals || goals);
          setFoodLog((d.foodLog || []).filter(x => x.date === todayKey()));
          setWeights(d.weights || [{date:todayKey(),weight:70}]);
          setWorkoutDone(d.workoutDone || {});
        }
      } catch(e) {}
      setLoaded(true);
    })();
  }, []);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem('fitfuel-v1', JSON.stringify({user,goals,foodLog,weights,workoutDone})).catch(()=>{});
  }, [loaded,user,goals,foodLog,weights,workoutDone]);

  const todaysLog = foodLog.filter(x => x.date === todayKey());
  const totals = useMemo(() => todaysLog.reduce((a,x) => {
    const f = FOOD.find(z => z.id === x.id); if(f){a.kcal += f.kcal*x.qty; a.protein += f.protein*x.qty;} return a;
  }, {kcal:0,protein:0}), [todaysLog]);
  const pct = (v,t) => Math.min(1, t > 0 ? v/t : 0);
  const addFood = (food) => setFoodLog(old => [...old, {id:food.id, qty:1, date:todayKey(), at:Date.now()}]);
  const removeFood = (at) => setFoodLog(old => old.filter(x => x.at !== at));
  const login = async () => {
    const n = nameInput.trim();
    if (!n) return Alert.alert('Add your name', 'Enter your name to create your local profile.');
    setUser({name:n, email:emailInput.trim()}); setTab('Home');
  };
  const addWeight = () => {
    const w = Number(weightInput);
    if (!Number.isFinite(w) || w < 20 || w > 350) return Alert.alert('Check weight', 'Enter a weight between 20 and 350 kg.');
    setWeights(old => [...old, {date:todayKey(),weight:w}]); setGoals(g => ({...g,weight:w}));
    Alert.alert('Progress saved', `${w} kg added to your progress log.`);
  };
  const askAI = () => {
    const q = chatInput.trim(); if(!q) return;
    const lower = q.toLowerCase(); let answer;
    if (lower.includes('protein')) answer = 'Useful protein options: eggs, milk, curd, paneer, tofu, dal, roasted chana, and chicken. Combine different sources across the day. Your current target is '+goals.protein+' g/day; suitability depends on your body, activity and health.';
    else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('afford')) answer = 'Budget-friendly options include dal, roasted chana, eggs (if you eat them), milk, curd, soy chunks and seasonal foods. Plan around foods available and affordable where you live.';
    else if (lower.includes('vegetarian') || lower.includes('veg')) answer = 'A vegetarian day could include oats with milk, dal and roti, curd with roasted chana, and paneer or tofu with rice and vegetables. Portions depend on your calorie and protein needs.';
    else if (lower.includes('weight') || lower.includes('fat')) answer = 'For body-composition changes, use a sustainable food plan, regular resistance training, sleep and gradual progress. Avoid crash diets; consider a registered dietitian for tailored targets.';
    else if (lower.includes('workout') || lower.includes('gym')) answer = 'Start with a manageable full-body or push/pull/legs routine, use controlled technique, and increase load gradually. Rest when needed. If you have injuries or health concerns, seek qualified guidance.';
    else answer = 'A practical starting point: build meals around a protein source, vegetables or fruit, and carbs that support training. Track your food for a few days, then adjust gradually. Tell me whether your goal is muscle gain, fat loss, or maintenance.';
    setChat(old => [...old,{from:'you',text:q},{from:'ai',text:answer}]); setChatInput('');
  };

  if (!loaded) return <SafeAreaView style={s.safe}><Text style={s.loading}>FITFUEL INDIA</Text></SafeAreaView>;
  if (!user) return <SafeAreaView style={s.safe}><ExpoStatusBar style="light"/><KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={s.loginWrap}>
    <View style={s.logo}><Ionicons name="fitness" size={34} color={C.bg}/></View>
    <Text style={s.eyebrow}>YOUR FITNESS, YOUR WAY</Text><Text style={s.hero}>Fuel your{"\n"}<Text style={{color:C.green}}>stronger self.</Text></Text>
    <Text style={s.muted}>Indian meals. Smart tracking. Consistent progress.</Text>
    <View style={[s.card,{marginTop:28}]}><Text style={s.sectionTitle}>Create your profile</Text><Text style={s.label}>YOUR NAME</Text><TextInput placeholder="e.g. Rahul" placeholderTextColor={C.muted} value={nameInput} onChangeText={setNameInput} style={s.input}/>
      <Text style={s.label}>EMAIL (OPTIONAL)</Text><TextInput placeholder="you@example.com" placeholderTextColor={C.muted} autoCapitalize="none" keyboardType="email-address" value={emailInput} onChangeText={setEmailInput} style={s.input}/>
      <TouchableOpacity style={s.primaryBtn} onPress={login}><Text style={s.primaryText}>Get started</Text><Ionicons name="arrow-forward" size={18} color={C.bg}/></TouchableOpacity>
      <Text style={s.smallMuted}>Demo profile saved on this device. This is not secure account authentication.</Text>
    </View>
  </KeyboardAvoidingView></SafeAreaView>;

  const Header = ({title,sub}) => <View style={s.pageHead}><View><Text style={s.eyebrow}>FITFUEL INDIA</Text><Text style={s.pageTitle}>{title}</Text>{sub?<Text style={s.muted}>{sub}</Text>:null}</View><View style={s.avatar}><Text style={s.avatarText}>{(user.name||'U').slice(0,1).toUpperCase()}</Text></View></View>;
  const CardTitle = ({title, action, onPress}) => <View style={s.rowBetween}><Text style={s.sectionTitle}>{title}</Text>{action?<TouchableOpacity onPress={onPress}><Text style={s.action}>{action}</Text></TouchableOpacity>:null}</View>;
  const ProgressBar = ({value,color=C.green}) => <View style={s.track}><View style={[s.fill,{width:`${Math.round(value*100)}%`,backgroundColor:color}]}/></View>;

  const renderHome = () => <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Header title={`Let's get stronger, ${user.name.split(' ')[0]}`} sub="Small steps. Strong habits."/>
    <View style={s.heroCard}><View style={s.heroGlow}/><Text style={s.heroTag}>TODAY'S FUEL</Text><Text style={s.heroNumber}>{Math.round(totals.kcal).toLocaleString()} <Text style={s.heroUnit}>kcal</Text></Text><Text style={s.heroSub}>{Math.max(0,Math.round(goals.cal-totals.kcal)).toLocaleString()} kcal left of {goals.cal.toLocaleString()}</Text><ProgressBar value={pct(totals.kcal,goals.cal)}/><View style={s.macroRow}><View style={s.macro}><Text style={s.macroLabel}>PROTEIN</Text><Text style={s.macroValue}>{totals.protein.toFixed(1)}<Text style={s.macroUnit}> g</Text></Text><ProgressBar value={pct(totals.protein,goals.protein)}/></View><View style={s.macroDivider}/><View style={s.macro}><Text style={s.macroLabel}>DAILY GOAL</Text><Text style={s.macroValue}>{goals.protein}<Text style={s.macroUnit}> g</Text></Text><Text style={s.tiny}>Protein target</Text></View></View></View>
    <CardTitle title="Quick actions"/>
    <View style={s.quickGrid}>{[['nutrition','Nutrition','restaurant-outline'],['workout','Workout','barbell-outline'],['progress','Progress','trending-up-outline'],['ai','AI coach','chatbubble-ellipses-outline']].map(([id,label,icon])=><TouchableOpacity key={id} style={s.quick} onPress={()=>setTab(id==='nutrition'?'Diet':id==='workout'?'Workout':id==='progress'?'Progress':'AI Coach')}><View style={s.quickIcon}><Ionicons name={icon} size={22} color={C.green}/></View><Text style={s.quickLabel}>{label}</Text><Ionicons name="arrow-up-right" size={15} color={C.muted} style={{position:'absolute',right:12,top:12}}/></TouchableOpacity>)}</View>
    <CardTitle title="Add food" action="See all" onPress={()=>setTab('Diet')}/>
    <View style={s.card}>{FOOD.slice(0,4).map(f=><FoodRow key={f.id} food={f} onAdd={()=>addFood(f)}/>)}</View>
    <CardTitle title="Today's food log"/>
    <View style={s.card}>{todaysLog.length===0?<Text style={s.muted}>Nothing logged yet. Add your first food above.</Text>:todaysLog.map((x,i)=>{const f=FOOD.find(z=>z.id===x.id);return <View key={x.at} style={s.logRow}><Text style={s.foodEmoji}>{f.icon}</Text><View style={{flex:1}}><Text style={s.foodName}>{f.name}</Text><Text style={s.foodMeta}>{Math.round(f.kcal*x.qty)} kcal · {(f.protein*x.qty).toFixed(1)} g protein</Text></View><TouchableOpacity onPress={()=>removeFood(x.at)}><Ionicons name="close-circle-outline" size={20} color={C.muted}/></TouchableOpacity></View>})}</View>
    <Text style={s.disclaimer}>Nutrition values are estimates. Consult a qualified professional for personalized advice.</Text>
  </ScrollView>;

  const renderDiet = () => <ScrollView contentContainerStyle={s.content}><Header title="Eat for your goal" sub="Everyday Indian food, made trackable."/>
    <View style={s.card}><CardTitle title="Your daily targets" action="Edit" onPress={()=>setTab('Profile')}/><View style={s.targetRow}><View><Text style={s.muted}>Calories</Text><Text style={s.bigStat}>{goals.cal.toLocaleString()} <Text style={s.unit}>kcal</Text></Text></View><View><Text style={s.muted}>Protein</Text><Text style={s.bigStat}>{goals.protein} <Text style={s.unit}>g</Text></Text></View></View></View>
    <CardTitle title="Build your food log" action={`${todaysLog.length} items`}/>
    <View style={s.card}>{FOOD.map(f=><FoodRow key={f.id} food={f} onAdd={()=>addFood(f)}/>)}</View>
    <CardTitle title="Sample day of meals"/>
    <View style={s.card}>{MEALS.map(m=><View key={m.time} style={s.mealRow}><View style={s.mealDot}><Ionicons name="checkmark" size={15} color={C.bg}/></View><View style={{flex:1}}><Text style={s.eyebrow}>{m.time}</Text><Text style={s.foodName}>{m.title}</Text><Text style={s.foodMeta}>{m.desc}</Text><Text style={s.mealMacro}>{m.kcal} kcal  ·  {m.protein} g protein (approx.)</Text></View></View>)}</View>
    <Text style={s.disclaimer}>Meal plan is an example, not a prescribed diet. Adjust for allergies, preferences, health needs, and portions.</Text>
  </ScrollView>;

  const renderWorkout = () => <ScrollView contentContainerStyle={s.content}><Header title="Train with purpose" sub="A simple starter routine. Use safe technique."/>
    <View style={[s.heroCard,{paddingBottom:20}]}><Text style={s.heroTag}>WEEKLY PLAN</Text><Text style={s.workoutHero}>Build the habit{"\n"}before the weight.</Text><Text style={s.heroSub}>Choose a session, mark it complete, and build consistency.</Text></View>
    {WORKOUTS.map((w,idx)=>{const done=!!workoutDone[todayKey()+w.day];return <View key={w.day} style={s.card}><View style={s.rowBetween}><View style={{flex:1}}><Text style={s.eyebrow}>{w.day}</Text><Text style={s.sectionTitle}>{w.name}</Text><Text style={s.muted}>{w.sub}</Text></View><TouchableOpacity onPress={()=>setWorkoutDone(old=>({...old,[todayKey()+w.day]:!old[todayKey()+w.day]}))} style={[s.checkBtn,done&&s.checkDone]}><Ionicons name={done?'checkmark':'checkmark-done-outline'} size={18} color={done?C.bg:C.green}/><Text style={[s.checkText,done&&{color:C.bg}]}>{done?'Done':'Complete'}</Text></TouchableOpacity></View><View style={s.exerciseList}>{w.moves.map((m,i)=><View key={m} style={s.exercise}><View style={s.exerciseNum}><Text style={s.exerciseNumText}>{i+1}</Text></View><Text style={s.exerciseText}>{m}</Text></View>)}</View></View>})}
    <Text style={s.disclaimer}>Routine is general guidance. Start light, prioritize technique, rest between sessions, and seek qualified advice if injured or unsure.</Text>
  </ScrollView>;

  const renderProgress = () => <ScrollView contentContainerStyle={s.content}><Header title="Your progress" sub="Consistency beats perfection."/>
    <View style={s.card}><Text style={s.eyebrow}>LATEST BODY WEIGHT</Text><Text style={s.weightBig}>{weights.length?weights[weights.length-1].weight:'—'} <Text style={s.unit}>kg</Text></Text><Text style={s.muted}>{weights.length} weight entries recorded</Text><View style={s.divider}/><Text style={s.sectionTitle}>Log your weight</Text><View style={s.inputRow}><TextInput value={weightInput} onChangeText={setWeightInput} keyboardType="decimal-pad" style={[s.input,{flex:1,marginBottom:0}]} placeholder="Weight in kg" placeholderTextColor={C.muted}/><TouchableOpacity style={s.primaryBtnSmall} onPress={addWeight}><Text style={s.primaryText}>Save</Text></TouchableOpacity></View></View>
    <View style={s.card}><CardTitle title="Weight history"/>{weights.slice(-8).reverse().map((w,i)=><View key={`${w.date}-${i}`} style={s.historyRow}><View style={s.historyDot}/><Text style={{flex:1,color:C.white}}>{w.date}</Text><Text style={s.historyWeight}>{w.weight} kg</Text></View>)}</View>
    <View style={s.card}><CardTitle title="Today's nutrition progress"/><View style={s.progressMetric}><View style={s.rowBetween}><Text style={s.foodName}>Calories</Text><Text style={s.foodMeta}>{Math.round(totals.kcal)} / {goals.cal} kcal</Text></View><ProgressBar value={pct(totals.kcal,goals.cal)}/></View><View style={s.progressMetric}><View style={s.rowBetween}><Text style={s.foodName}>Protein</Text><Text style={s.foodMeta}>{Math.round(totals.protein)} / {goals.protein} g</Text></View><ProgressBar value={pct(totals.protein,goals.protein)}/></View></View>
    <Text style={s.disclaimer}>Weight naturally fluctuates. Look at longer-term trends rather than a single day's change.</Text>
  </ScrollView>;

  const renderAI = () => <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><View style={s.content}><Header title="FitFuel AI coach" sub="Ask about meals, protein, and training."/><View style={s.aiNotice}><Ionicons name="sparkles" color={C.green} size={18}/><Text style={s.aiNoticeText}>Starter demo: answers are generated from built-in guidance, not a live AI service.</Text></View></View><ScrollView style={s.chatArea} contentContainerStyle={{paddingHorizontal:18,paddingBottom:16}}>{chat.map((m,i)=><View key={i} style={[s.bubble,m.from==='you'?s.userBubble:s.aiBubble]}><Text style={[s.bubbleText,m.from==='you'&&{color:C.bg}]}>{m.text}</Text></View>)}</ScrollView><View style={s.chatInputRow}><TextInput value={chatInput} onChangeText={setChatInput} onSubmitEditing={askAI} placeholder="Ask about protein or meals..." placeholderTextColor={C.muted} style={[s.input,{flex:1,marginBottom:0}]}/><TouchableOpacity onPress={askAI} style={s.sendBtn}><Ionicons name="arrow-up" size={22} color={C.bg}/></TouchableOpacity></View></KeyboardAvoidingView>;

  const renderProfile = () => <ScrollView contentContainerStyle={s.content}><Header title="Your profile" sub="Set targets that suit your routine."/>
    <View style={s.card}><View style={s.profileHeader}><View style={[s.avatar,{width:56,height:56,borderRadius:28}]}><Text style={[s.avatarText,{fontSize:22}]}>{user.name.slice(0,1).toUpperCase()}</Text></View><View style={{flex:1}}><Text style={s.sectionTitle}>{user.name}</Text><Text style={s.muted}>{user.email||'Local demo profile'}</Text></View></View><View style={s.divider}/>
      <Text style={s.label}>FITNESS GOAL</Text><View style={s.choiceRow}>{['Muscle gain','Fat loss','Maintain'].map(x=><TouchableOpacity key={x} onPress={()=>setGoals(g=>({...g,goal:x}))} style={[s.choice,goals.goal===x&&s.choiceActive]}><Text style={[s.choiceText,goals.goal===x&&{color:C.bg}]}>{x}</Text></TouchableOpacity>)}</View>
      <Text style={s.label}>DIET PREFERENCE</Text><View style={s.choiceRow}>{['Veg','Both'].map(x=><TouchableOpacity key={x} onPress={()=>setGoals(g=>({...g,diet:x}))} style={[s.choice,goals.diet===x&&s.choiceActive]}><Text style={[s.choiceText,goals.diet===x&&{color:C.bg}]}>{x==='Both'?'Veg + Non-veg':x}</Text></TouchableOpacity>)}</View>
      <Text style={s.label}>DAILY CALORIE TARGET</Text><TextInput value={String(goals.cal)} onChangeText={v=>setGoals(g=>({...g,cal:Number(v)||0}))} keyboardType="number-pad" style={s.input}/>
      <Text style={s.label}>DAILY PROTEIN TARGET (G)</Text><TextInput value={String(goals.protein)} onChangeText={v=>setGoals(g=>({...g,protein:Number(v)||0}))} keyboardType="number-pad" style={s.input}/>
      <TouchableOpacity style={s.primaryBtn} onPress={()=>{if(goals.cal<500||goals.cal>8000||goals.protein<10||goals.protein>400){Alert.alert('Check targets','Enter 500–8000 calories and 10–400 g protein.');return;}Alert.alert('Saved','Your goals are updated.')}}><Text style={s.primaryText}>Save preferences</Text><Ionicons name="checkmark" size={18} color={C.bg}/></TouchableOpacity>
    </View>
    <TouchableOpacity style={s.logoutBtn} onPress={()=>Alert.alert('Sign out?', 'This demo profile is stored locally on this device.',[{text:'Cancel',style:'cancel'},{text:'Sign out',style:'destructive',onPress:()=>{setUser(null);setTab('Home');}}])}><Ionicons name="log-out-outline" size={19} color={C.red}/><Text style={{color:C.red,fontWeight:'700'}}>Sign out</Text></TouchableOpacity>
    <Text style={s.disclaimer}>This demo stores profile data locally on your device. It does not create a secure online account.</Text>
  </ScrollView>;

  const tabs = [
    {id:'Home',icon:'home-outline',label:'Home'},
    {id:'Diet',icon:'nutrition-outline',label:'Diet'},
    {id:'Workout',icon:'barbell-outline',label:'Workout'},
    {id:'Progress',icon:'stats-chart-outline',label:'Progress'},
    {id:'AI Coach',icon:'sparkles-outline',label:'AI Coach'}
  ];
  return <SafeAreaView style={s.safe}><ExpoStatusBar style="light"/><View style={{flex:1}}>
    {tab==='Home'?renderHome():tab==='Diet'?renderDiet():tab==='Workout'?renderWorkout():tab==='Progress'?renderProgress():tab==='AI Coach'?renderAI():renderProfile()}
    {tab!=='AI Coach'&&<View style={s.bottomNav}>{tabs.map(t=><TouchableOpacity key={t.id} onPress={()=>setTab(t.id)} style={s.navItem}><Ionicons name={t.icon} size={21} color={tab===t.id?C.green:C.muted}/><Text style={[s.navLabel,tab===t.id&&{color:C.green}]}>{t.label}</Text></TouchableOpacity>)}<TouchableOpacity onPress={()=>setTab('Profile')} style={s.navItem}><Ionicons name="person-circle-outline" size={21} color={tab==='Profile'?C.green:C.muted}/><Text style={[s.navLabel,tab==='Profile'&&{color:C.green}]}>Profile</Text></TouchableOpacity></View>}
  </View></SafeAreaView>;
}

function FoodRow({food,onAdd}) {
  return <View style={s.foodRow}><View style={s.foodEmojiBox}><Text style={s.foodEmoji}>{food.icon}</Text></View><View style={{flex:1}}><Text style={s.foodName}>{food.name}</Text><Text style={s.foodMeta}>{food.serving} · {food.kcal} kcal</Text><Text style={s.foodProtein}>{food.protein} g protein</Text></View><TouchableOpacity style={s.addBtn} onPress={onAdd}><Ionicons name="add" size={21} color={C.bg}/></TouchableOpacity></View>;
}

const s = StyleSheet.create({
 safe:{flex:1,backgroundColor:C.bg,paddingTop:Platform.OS==='android'?StatusBar.currentHeight||0:0}, loading:{color:C.green,textAlign:'center',marginTop:80,fontWeight:'900',letterSpacing:3},
 loginWrap:{flex:1,justifyContent:'center',padding:24},logo:{width:64,height:64,borderRadius:22,backgroundColor:C.green,alignItems:'center',justifyContent:'center',marginBottom:25},
 eyebrow:{fontSize:10,letterSpacing:1.8,fontWeight:'900',color:C.green,marginBottom:7},hero:{fontSize:43,fontWeight:'900',lineHeight:47,color:C.white,letterSpacing:-1.5},muted:{fontSize:13,color:C.muted,lineHeight:20},card:{backgroundColor:C.panel,borderRadius:20,borderWidth:1,borderColor:C.line,padding:16,marginBottom:14},
 sectionTitle:{fontSize:17,fontWeight:'800',color:C.white,marginBottom:10},label:{fontSize:10,fontWeight:'800',letterSpacing:1.2,color:C.muted,marginTop:13,marginBottom:7},
 input:{backgroundColor:'#0D1410',borderColor:C.line,borderWidth:1,borderRadius:12,paddingHorizontal:13,paddingVertical:12,color:C.white,marginBottom:3,fontSize:15},
 primaryBtn:{backgroundColor:C.green,borderRadius:13,padding:15,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8,marginTop:16},primaryText:{color:C.bg,fontSize:15,fontWeight:'900'},smallMuted:{fontSize:10,color:C.muted,textAlign:'center',marginTop:12,lineHeight:16},
 content:{paddingHorizontal:17,paddingTop:16,paddingBottom:24},pageHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},pageTitle:{fontSize:27,fontWeight:'900',color:C.white,letterSpacing:-.7,marginBottom:4,maxWidth:300},avatar:{width:42,height:42,borderRadius:15,backgroundColor:C.panel2,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center'},avatarText:{color:C.green,fontSize:17,fontWeight:'900'},
 heroCard:{backgroundColor:'#1D3022',borderRadius:22,padding:19,marginBottom:22,borderWidth:1,borderColor:'#38563A',overflow:'hidden'},heroGlow:{position:'absolute',right:-38,top:-50,width:160,height:160,borderRadius:80,backgroundColor:'#304E2B',opacity:.7},heroTag:{fontSize:10,letterSpacing:1.6,color:C.green,fontWeight:'900'},heroNumber:{fontSize:39,fontWeight:'900',color:C.white,marginTop:8,letterSpacing:-1},heroUnit:{fontSize:15,color:C.muted,fontWeight:'600'},heroSub:{fontSize:12,color:'#C0CDBF',marginBottom:15},track:{height:7,backgroundColor:'#344437',borderRadius:10,overflow:'hidden',marginTop:7},fill:{height:'100%',borderRadius:10},macroRow:{flexDirection:'row',marginTop:18,alignItems:'center'},macro:{flex:1},macroDivider:{height:42,width:1,backgroundColor:'#496049',marginHorizontal:14},macroLabel:{fontSize:9,letterSpacing:1.2,color:'#B3C4B2',fontWeight:'900'},macroValue:{fontSize:22,fontWeight:'900',color:C.white,marginTop:3},macroUnit:{fontSize:12,color:C.muted},tiny:{fontSize:10,color:C.muted,marginTop:2},
 rowBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},action:{color:C.green,fontWeight:'800',fontSize:12,marginBottom:9},quickGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:20},quick:{width:'48%',minHeight:100,backgroundColor:C.panel,borderRadius:17,borderWidth:1,borderColor:C.line,padding:13,justifyContent:'space-between'},quickIcon:{width:39,height:39,borderRadius:13,backgroundColor:'#26372A',alignItems:'center',justifyContent:'center'},quickLabel:{fontWeight:'800',fontSize:14,color:C.white,marginTop:12},
 foodRow:{flexDirection:'row',alignItems:'center',paddingVertical:11,borderBottomWidth:1,borderBottomColor:C.line,gap:11},foodEmojiBox:{width:43,height:43,borderRadius:14,backgroundColor:C.panel2,alignItems:'center',justifyContent:'center'},foodEmoji:{fontSize:22},foodName:{fontSize:14,fontWeight:'800',color:C.white},foodMeta:{fontSize:11,color:C.muted,marginTop:3,lineHeight:16},foodProtein:{fontSize:11,color:C.green,fontWeight:'800',marginTop:2},addBtn:{width:35,height:35,borderRadius:12,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},logRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:9,borderBottomWidth:1,borderBottomColor:C.line},disclaimer:{fontSize:10,color:C.muted,lineHeight:16,marginVertical:8},
 targetRow:{flexDirection:'row',gap:45},bigStat:{fontSize:26,color:C.green,fontWeight:'900',marginTop:4},unit:{fontSize:12,color:C.muted,fontWeight:'600'},mealRow:{flexDirection:'row',gap:12,paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.line},mealDot:{width:25,height:25,borderRadius:9,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},mealMacro:{fontSize:11,color:C.green,fontWeight:'800',marginTop:6},divider:{height:1,backgroundColor:C.line,marginVertical:16},
 workoutHero:{fontSize:27,fontWeight:'900',color:C.white,marginTop:8,marginBottom:5,lineHeight:32},checkBtn:{flexDirection:'row',alignItems:'center',gap:4,paddingHorizontal:10,paddingVertical:8,borderRadius:10,borderWidth:1,borderColor:C.green},checkDone:{backgroundColor:C.green},checkText:{fontSize:11,color:C.green,fontWeight:'800'},exerciseList:{marginTop:12,borderTopWidth:1,borderTopColor:C.line,paddingTop:9},exercise:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:7},exerciseNum:{width:25,height:25,borderRadius:8,backgroundColor:C.panel2,alignItems:'center',justifyContent:'center'},exerciseNumText:{fontSize:11,color:C.green,fontWeight:'800'},exerciseText:{fontSize:13,color:'#DDE5DE',flex:1},
 weightBig:{fontSize:42,fontWeight:'900',color:C.green,marginTop:2},inputRow:{flexDirection:'row',gap:9,marginTop:10},primaryBtnSmall:{backgroundColor:C.green,paddingHorizontal:18,borderRadius:12,alignItems:'center',justifyContent:'center'},historyRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:11,borderBottomWidth:1,borderBottomColor:C.line},historyDot:{width:8,height:8,borderRadius:4,backgroundColor:C.green},historyWeight:{color:C.white,fontWeight:'800'},progressMetric:{marginTop:10,marginBottom:13},
 aiNotice:{backgroundColor:'#1A2B20',borderRadius:12,padding:12,flexDirection:'row',alignItems:'center',gap:9,marginBottom:12},aiNoticeText:{color:'#C7D7C8',fontSize:11,flex:1,lineHeight:16},chatArea:{flex:1},bubble:{maxWidth:'88%',padding:13,borderRadius:16,marginBottom:10},aiBubble:{backgroundColor:C.panel,borderBottomLeftRadius:4,alignSelf:'flex-start',borderWidth:1,borderColor:C.line},userBubble:{backgroundColor:C.green,borderBottomRightRadius:4,alignSelf:'flex-end'},bubbleText:{fontSize:13,color:C.white,lineHeight:19},chatInputRow:{flexDirection:'row',gap:8,paddingHorizontal:15,paddingVertical:10,borderTopWidth:1,borderTopColor:C.line,backgroundColor:C.bg,alignItems:'center'},sendBtn:{width:45,height:45,borderRadius:14,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
 profileHeader:{flexDirection:'row',alignItems:'center',gap:13,marginBottom:10},choiceRow:{flexDirection:'row',gap:8,marginBottom:7},choice:{paddingVertical:9,paddingHorizontal:12,borderRadius:10,borderWidth:1,borderColor:C.line,backgroundColor:C.panel2},choiceActive:{backgroundColor:C.green,borderColor:C.green},choiceText:{color:C.muted,fontSize:12,fontWeight:'800'},logoutBtn:{borderWidth:1,borderColor:'#5A302F',borderRadius:13,padding:14,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:8,marginTop:2},
 bottomNav:{flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingTop:9,paddingBottom:Platform.OS==='android'?8:14,borderTopWidth:1,borderTopColor:C.line,backgroundColor:'#101713'},navItem:{alignItems:'center',justifyContent:'center',gap:4,flex:1},navLabel:{fontSize:9,color:C.muted,fontWeight:'700'}
});
