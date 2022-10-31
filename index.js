

const express=require('express');
const cors=require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const axios=require('axios');



    //express app initialization
const app = express();
app.use(express.json());


    //...................middleware........................
app.use(cors());

//port 
const port=process.env.PORT||5000;





const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster2.v5bzpns.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });






async function run() {
    try {
     await client.connect();
    
     const usersDatabase = client.db("All_Users");
     const usersCollection = usersDatabase.collection("Users");

    
  

      
    
// //Get  all users data

      app.get('/allUsers',async (req,res)=>{
       const usersCursor= usersCollection.find({});
       const users=await usersCursor.toArray();
       res.send(users);


     })




     //id diye khuje ber kora
     app.get('/singleUser/:id', async(req,res)=>{
       const id=req.params.id;
     const query={macId:id};
     const user=await usersCollection.findOne(query)
     res.send(user)
     
     })
      // post API

     app.post('/AddUsers',async(req,res)=>{
       const newUsers=req.body;
       // newOrders.createdAt=new Date();
       // console.log(newOrders);
       const result = await usersCollection.insertOne( newUsers)
       // console.log("hitting the post ")
    //    res.send(result)
       res.json(result);

     })




     //-----------PUT---------------

     app.put('/allUsers', async(req,res)=>{
      // const id=req.body;
      const user=req.body;
      // console.log('put',user)
      const filter={macId:user.macId};
      const options={upsert:true};
      const updateDoc={
        $set:{
          price:user.price
        }
      };
      const result=await usersCollection.updateOne(filter,updateDoc,options)
      res.json(result);
    
    
    })


   } 
   
   finally {
            //   await client.close();
   }
 }

 run().catch(console.dir);


          //  -------------fetching all users--------------------

  const allUsers=async()=>{
         let users;
             await axios.get('http://localhost:5000/allUsers')
             .then(function (response) {
               // handle success
               users=response.data;
             })
             .catch(function (error) {
               
               console.log(error);
             })
             .then(function () {
               // always executed
             });          
    return users;
  }

     //------------fetching day-price-------------------

const  datePrice=async()=>{
         let dPrice;
 await axios.post("http://185.96.163.154:2335/getDayPrice", {
    "sensor_id": "1234abc1",
        "gateway_id": "1234abc2",
        "app_id": "1234abc2",
        "start_date": "2022-10-29",
        "end_date": "2022-10-30"
  },{
    headers: {
      'content-type':'application/json',
      'Api-Key':'India75',
   // 'Connection':'keep-alive',
   // 'Accept-Encoding':'gzip,deflate,br',
   // 'Accept':'*/*'
    }
  })
  .then(function (response) {
    dPrice=response.data. OperatingPoint;
  })
  .catch(function (error) {
    console.log(error);
  });

  return dPrice;   
}
 


 const call=async()=>{
  const d = new Date();
  let day = d.getUTCDate()
  let hour = d.getHours();

  try{
   let users= await allUsers();
    // console.log(users[0]);
    let dPrice=await datePrice()
    // console.log(dPrice[hour-1]); 
    // console.log(hour)
    
   for(let i=0;i<users.length;i++){
        if(users[i].price<dPrice[hour-1].price && hour!=0){
                        
          await axios.post("http://185.96.163.154:2336/controlSwitch", {
            "gateway_id": "30:ae:7b:e2:e6:9e",
            "switch_id": "000d6f000be7b777",
            "off_on": 0
          },{
            headers: {
              'content-type':'application/json',
              'Api-Key':'India75',
           // 'Connection':'keep-alive',
           // 'Accept-Encoding':'gzip,deflate,br',
           // 'Accept':'*/*'
            }
          })
          .then(function (response) {
            console.log("OFF");
          })
          .catch(function (error) {
            console.log(error);
          });
        

        }
       else if(users[i].price<dPrice[23].price && hour==0){
                        
          await axios.post("http://185.96.163.154:2336/controlSwitch", {
            "gateway_id": "30:ae:7b:e2:e6:9e",
            "switch_id": "000d6f000be7b777",
            "off_on": 0
          },{
            headers: {
              'content-type':'application/json',
              'Api-Key':'India75',
           // 'Connection':'keep-alive',
           // 'Accept-Encoding':'gzip,deflate,br',
           // 'Accept':'*/*'
            }
          })
          .then(function (response) {
            console.log("OFF");
          })
          .catch(function (error) {
            console.log(error);
          });
        

        }
        else{

          await axios.post("http://185.96.163.154:2336/controlSwitch", {
            "gateway_id": "30:ae:7b:e2:e6:9e",
            "switch_id": "000d6f000be7b777",
            "off_on": 1
          },{
            headers: {
              'content-type':'application/json',
              'Api-Key':'India75',
           // 'Connection':'keep-alive',
           // 'Accept-Encoding':'gzip,deflate,br',
           // 'Accept':'*/*'
            }
          })
          .then(function (response) {
            console.log("On");
          })
          .catch(function (error) {
            console.log(error);
          });

        }
     
   }
  


   
  }
  catch{
    console.log('call function err')
  }

 }

 setInterval(call,10000)


 app.get('/',(req,res)=>{
     res.send('Running my server')
 })



 app.listen(port,()=>{
     console.log('Running server on port',port)
 })