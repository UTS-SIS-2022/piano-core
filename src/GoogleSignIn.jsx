import React, { Component } from "react";
export default class GoogleSignIn extends Component {

    onSignIn = (googleUser) => {
        console.log("Google info");
        // const profile = googleUser.getBasicProfile();
        // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        // console.log('Name: ' + profile.getName());
        // console.log('Image URL: ' + profile.getImageUrl());
    }
    render() {
        return (
            <div>
                <div className="g-signin2" onClick={this.onSignIn}>Google</div>    
            </div>
            
        );
    }
}