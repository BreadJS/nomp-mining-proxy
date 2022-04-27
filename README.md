# nomp-mining-proxy

![alt text](https://i.imgur.com/TLoBcCn.png "Program in action")

## What is "Nomp Mining Proxy'?
> With "Nomp Mining Proxy" you can mine to any nomp pool from your own IP address. This is usefull if you're mining on a pool that is IP restricted and you have miners on multiple IP addresses.

## Why did you create "Nomp Mining Proxy'?
> I was mining a Equihash coin that only allowed certain user to mine by approving there IP address (I know, it's stupid). But when I got accepted on the pool I couldn't mine with all my rigs because they are distributed on multiple locations.

## Is this usefull for me?
> If you can portforward then yes this could be usefull for you. Why you'd ask? Even if you don't mine on a IP restricted pool but still want to keep track of you mining rigs, that is easily doable with this tool.

## Future of "Nomp Mining Proxy"?
> I will be adding some extra features like looking up your stats trough an http server. Maybe even a pool switcher if one pool is down it will switch to the other. 

## Will you be creating the same thing but for different pools?
> I'm not sure yet, if I got time maybe.

## Installation / Usage
> It's verry easy to set it up. Go into the `index.js` file and look at the top for `workerApi`, `localport`, `remotehost`, `remoteport`. Change `workerApi` with the worker stats API of the nomp pool. `localport` will be your port where you connect your miner to. `remotehost` and `remoteport` will be the hostname/ip and port of the pool you're going to mine on. Then run these commands below in your terminal (Windows/Linux/OSX) and you can start your miners! 
```
$ npm install
$ node .
```
