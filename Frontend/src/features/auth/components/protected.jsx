import { useAuth } from "../hooks/use.auth";
import React, { use } from 'react'
import { Children } from "react";
import { Navigate } from "react-router";

const Protected = () => {
    const {loading,user} = useAuth()

    if(loading){
        return(<main><h1>Loading...</h1></main>)
    }

    if(!user){
        return <Navigate to = {'/login'} />
    }

    return Children
}

export default Protected