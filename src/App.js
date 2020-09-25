import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config'

firebase.initializeApp(firebaseConfig);




function App() {
  const [newUser, setNewUsers] = useState(false);
  const [user, setusers] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    photo: ''
  })

  const googlProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSingIn = () => {
    firebase.auth().signInWithPopup(googlProvider)
      .then(res => {
        const { displayName, email, photoURL } = res.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setusers(signedInUser)
        console.log(displayName, email, photoURL);
      })
      .catch(err => {
        console.log(err)
        console.log(err.message)
      })
  }
  const handleFbSignIn = () => {
    firebase.auth().signInWithPopup(fbProvider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log('sign in',user)
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }
  const handleSingOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const signOutUser = {
          isSignedIn: false,
          name: '',
          email: '',
          photo: '',
          error: '',
          success: false
        }
        setusers(signOutUser);
      })
      .catch(err => {

      })
  }
  const handleBlur = (e) => {

    let isFieldValied = true;
    if (e.target.name === 'email') {
      isFieldValied = /\S+@\S+\.\S+/.test(e.target.value)
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 7;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValied = isPasswordValid && passwordHasNumber;
    }
    if (isFieldValied) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setusers(newUserInfo);
    }
  }
  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setusers(newUserInfo);
          updateUserName(user.name)
        })
        .catch(function (error) {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setusers(newUserInfo);
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setusers(newUserInfo)
          console.log('sign in user info', res.user);
        })
        .catch(function (error) {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setusers(newUserInfo);
        });
    }
    e.preventDefault();
  }
      const updateUserName = name => {
        const user = firebase.auth().currentUser;

        user.updateProfile({
          displayName: name
        }).then(function () {
          console.log("user name update successfully")
        }).catch(function (error) {
          console.log(error)
        });
      }
  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSingOut} >Sign out</button> :
          <button onClick={handleSingIn} >Sign In</button>
      }
      <br />
      <button onClick={handleFbSignIn}>Log In Using Facebook</button>
      {
        user.isSignedIn &&
        <div>
          <p> {user.name} </p>
          <p>
            {user.email}
          </p>
          <img src={user.photo} alt=""></img>

        </div>
      }
      <h1>Our Own Authentication</h1>
      <input type="checkbox" onChange={() => setNewUsers(!newUser)} name="newUser" id=""></input>
      <label htmlFor="newUser">New user sign up</label>
      <form onSubmit={handleSubmit} >
        {newUser && <input type="text" onBlur={handleBlur} name="name" placeholder="Your Name" ></input>} <br />
        <input type="text" onBlur={handleBlur} name="email" placeholder="Your Email Address" required></input><br />
        <input type="password" onBlur={handleBlur} name="password" placeholder="Your password" required></input><br />
        <input type="submit" value={newUser? 'Sign up': 'Sign In'}></input><br />
      </form>
      <p style={{ color: "red" }} > {user.error} </p>
      {user.success && <p style={{ color: "green" }}>User {newUser ? 'created' : 'logged In'} successfully</p>}
    </div>
  );
}

export default App;
