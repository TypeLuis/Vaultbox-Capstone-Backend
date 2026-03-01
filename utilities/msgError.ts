const msgError = (status:number, msg:string) => {
    const err = new Error(msg) as Error & { status: number };
    err.status = status ;
    return err;
}
  
export default msgError;