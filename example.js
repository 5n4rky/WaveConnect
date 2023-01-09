let f = async ()=>
{
    i = 1;

}

let g =async ()=>
{
    await f();
    console.log(i);
}

g();