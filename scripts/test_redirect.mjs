const res = await fetch("https://rxaxptszsytnanfixfst.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Flinea.mentrixestudios.com%2Fperfil", {
  redirect: "manual"
});
console.log("Status:", res.status);
console.log("Location:", res.headers.get("location"));
