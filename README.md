# Cinnamon

Simple and lightweight streaming server with support for mega.nz files and sequential video chunk streaming.

## Warning

This project is still in development and is not ready for production use, use at your own risk.

mega.nz allows a maximum of 5GB of transfer per day without an account per IP, will need to implement proxies or something similar to bypass this limit.

## Example

```
localhost:3000
  /multistream
  ?destination=[
    ADFxCR7b%23YTzQKIuIV8XFE9nkllS1GkN17SzujNxD-fvSUDQ8TSk, <--- 1st part
    9O8S1TbY%23EFUpSMrm-ptuZ-s2XFHIrQfeE73OpHOyh3k2PDKOdCM, <--- 2nd part
    gKNg0Dib%23g9bj7C4zwnsg2TUDDn2JCoXpi6CCzKlqE2guRKucqPg, <--- 3rd part
    hHUDgaxJ%23UE2-i-BgDVOAZJjFNCtt3BozM_zL8B1jqOiwXhTrero  <--- 4th part
  ]
```

##### Mostly proof of concept, no plans for full release.
