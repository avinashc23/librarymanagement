//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Avinash:Avi@2302@cluster0.hbln3.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true, useFindAndModify: false}));

const itemschema= {
  name: String
}

const Item=mongoose.model("Item",itemschema);

const item1 = new Item({
  name: "welcome to your todolist!"
})

const item2 = new Item({
  name: "hit the + button to add new task"
})

const item3 = new Item({
  name: "hit the check box to delete a task"
})

const defaultArray= [item1 , item2 , item3];


const listSchema={
  name: String,
  items: [itemschema]
}

const List= mongoose.model("List",listSchema);




// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


app.get("/", function(req, res) {
const day = date.getDate();
Item.find({},function(err,founditems){
  if(founditems.length===0){
    Item.insertMany(defaultArray,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("successfully saves defaultArray in the database");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: day, newListItems: founditems});
  }

})

});


app.get("/:CustomListName",function(req,res){
  const CustomListName=_.capitalize(req.params.CustomListName);

List.findOne({name:CustomListName},function(err,foundList){
  if(!err){
    if(!foundList){
      const list = new List({
        name:CustomListName,
        items: defaultArray
      });
      list.save();
      res.redirect("/"+CustomListName);
    }
  else{
    res.render("list",{listTitle:foundList.name, newListItems: foundList.items});
  }
}
});


});


app.post("/", function(req, res){
  const day = date.getDate();

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item= new Item({
     name : itemName
  });

   if(listName===day){
     item.save();
     res.redirect("/");
   }else{
     List.findOne({name:listName},function(err,foundList){
       foundList.items.push(item);
       foundList.save();
       res.redirect("/"+listName);
     });
   }


 });

 app.post("/delete",function(req,res){
   const day = date.getDate();
   const checkedItemId=req.body.checkbox;
   const newlistName=req.body.newlistName;
   if(newlistName===day){
     Item.findByIdAndRemove(checkedItemId,function(err){
       if(err){
         console.log(err);
       }else{
         console.log("successfully deleted the checked item");
       }
     })
     res.redirect("/");
   }else{
     List.findOneAndUpdate(
       {name:newlistName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
         if(!err){
          res.redirect("/"+newlistName);
         }
       }
     );
   }

 });

 app.get("/favicon.ico", function(req, res){
     res.sendStatus(204);
 });

app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.PORT;
if(port== null || port==""){
  port=3000;
}


app.listen(port, function() {
  console.log("Server started successfully on port ");
});
