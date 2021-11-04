# MulesoftHackathon2021

This is the source code for Mulesoft Hackathon 2021.
For the detail of this project, please refer to [here](https://devpost.com/software/let-s-work-together-to-make-a-haiku)

Architecture diagram for API is as follow.
![API](/API_Architecture_Diagram.PNG)

At the system layer([haiku_s_api](https://github.com/HninPwintP/MulesoftHackathon2021/tree/main/Mulesoft/haiku-s-api)), all of the required data is unlocked and combined as the format that much the need of this application.

At the process layer([haiku_p_api](https://github.com/HninPwintP/MulesoftHackathon2021/tree/main/Mulesoft/haiku-p-api)), process for translate the content of haiku is implemented here. Google translate api is used for translating.

At the experience layer([haiku_ex_api](https://github.com/HninPwintP/MulesoftHackathon2021/tree/main/Mulesoft/haiku-ex-api)), this is the only api access by the ui component developer,process like callout the process api and adjusting format for ui are all implemented here.
