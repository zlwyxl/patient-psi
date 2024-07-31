import { PatientProfile } from "./data/patient-profiles";
import { patientTypes, patientTypeDescriptions } from "./data/patient-types";
import { auth } from "@/auth";
import { kv } from "@vercel/kv";
import { profile } from "console";

async function assignParticipantSessions(userId: string, sessions: string[]) {
    const key = `assigned:${userId}`;
    const value = {
        'sessions': sessions
    };
    await kv.set(key, JSON.stringify(value));
}

async function getUserID(): Promise<string | null> {
    const session = await auth();
    return session?.user ? session?.user?.id : null;
}

export async function setProfile(newProfile: PatientProfile | null) {
    try {
        const userID = await getUserID();
        const profileKey = `curr_profile_${userID}`;
        await kv.set(profileKey, JSON.stringify(newProfile));
    } catch (error) {
        console.error('Error storing patient profile to KV:', error);
    }
}

export async function getProfile(): Promise<PatientProfile | null> {
    const userID = await getUserID();
    const profileKey = `curr_profile_${userID}`;
    const profileData = await kv.get(profileKey);
    return profileData ? profileData as PatientProfile : null;
}

export async function setPatientType(patientType: string) {
    try {
        const userID = await getUserID();
        console.log("userID:", userID);
        const patientTypeKey = `curr_type_${userID}`;
        await kv.set(patientTypeKey, patientType);
    } catch (error) {
        console.error('Error storing patient type to KV:', error);
    }
}

export async function getPatientType(): Promise<string> {
    const userID = await getUserID();
    const patientTypeKey = `curr_type_${userID}`;
    const patientType = await kv.get(patientTypeKey);
    return patientType as string;
}

// Random sample
// export async function sampleProfile(): Promise<PatientProfile | null> {
//     try {
//         const all_keys = await kv.keys('profile_*');

//         if (all_keys.length === 0) {
//             throw new Error('No profiles found');
//         }

//         const randomIndex = Math.floor(Math.random() * all_keys.length);
//         const randomKey = all_keys[randomIndex];

//         const profileData = await kv.get(randomKey);

//         if (!profileData) {
//             return null;
//         }

//         try {
//             return profileData as PatientProfile;
//         } catch (error) {
//             console.error('Error parsing profile data:', error);
//             return null;
//         }
//     } catch (error) {
//         console.error('Error sampling profile:', error);
//         throw error;
//     }

// }

export async function sampleProfile(): Promise<PatientProfile | null> {
    try {
        const userID = await getUserID() as string;
        const userListString = await kv.get(`assigned:${userID}`);
        if (userListString) {
            console.log("userstring:",userListString);
            console.log("no userstring");

            const userList = userListString as { sessions: string[] };
            if (userList.sessions.length > 0) {
                const profileData = await kv.get(`profile_${userList.sessions[0]}`);
                if (profileData) {
                    const updatedSessions = userList.sessions.slice(1);
                    assignParticipantSessions(userID, updatedSessions);
                    try { 
                        return profileData as PatientProfile;
                    } catch (error) {
                        console.error('Error parsing profile data:', error);
                        return null;
                    }

                }
            }

        }
        console.log("no userstring");
        const all_keys = await kv.keys('profile_*');

        if (all_keys.length === 0) {
            throw new Error('No profiles found');
        }

        const randomIndex = Math.floor(Math.random() * all_keys.length);
        const randomKey = all_keys[randomIndex];

        const profileData = await kv.get(randomKey);

        if (!profileData) {
            return null;
        }

        try {
            return profileData as PatientProfile;
        } catch (error) {
            console.error('Error parsing profile data:', error);
            return null;
        }
    } catch (error) {
        console.error('Error sampling profile:', error);
        throw error;
    }

}


export async function getPrompt(): Promise<string> {
    const profile = await getProfile();
    console.log("profile:",profile);
    const prompt = formatPromptString(profile);
    console.log("prompt:",prompt);
    return prompt;
}

async function formatPromptString(data: any): Promise<string> {
    const patientType = await getPatientType() as keyof typeof patientTypeDescriptions;
    console.log("patientType:",patientType);
    // const patientTypeContent = patientTypeDescriptions[patientType];
    const patientTypeContent = patientTypes.find((item) => item.type === patientType)?.content
    console.log("patientTypeContent:",patientTypeContent)
    console.log("data:", data);
    const prompt = `想象你是${data.name}，一位正在经历心理健康挑战的患者。你已经参加了数周的心理治疗课程。你的任务是像${data.name}在认知行为治疗（CBT）课程中那样与治疗师进行对话。请根据“Relevant history”部分提供的${data.name}背景信息来调整你的回答。你的思考过程应受到“Cognitive Conceptualization Diagram”部分中的认知概念化图表的指导，但避免直接引用该图表，因为真实患者不会明确地以这种方式思考。\n\n
    
                Patient History：${data.history}\n\n
                Cognitive Conceptualization Diagram： \n
                Core Beliefs：${data.core_belief}\n
                Intermediate Beliefs：${data.intermediate_belief}\n
                Intermediate Beliefs during Depression：${data.intermediate_belief_depression}\n
                Coping Strategies：${data.coping_strategies}\n\n
                你将会被问到过去一周的经历。请与治疗师就以下situation和behavior进行对话。可以使用提供的emotions和automatic thoughts作为参考，但不要直接透露cognitive conceptualization diagram。相反，让你的回答受到图表的启发，从而使治疗师能够推断你的思考过程。\n\n
                Situation: ${data.situation}\n
                Automatic Thoughts: ${data.auto_thoughts}\n
                Emotions: ${data.emotion}\n
                Behavior: ${data.behavior}\n\n
                在即将进行的对话中，你将模拟治疗课程中的${data.name}，而用户将扮演治疗师的角色。请遵循以下指南：\n
                1. ${patientTypeContent}\n
                2. 模拟真实患者的举止和回应，以确保互动的真实性。使用自然语言，包括犹豫、停顿和情感表达，以增强您回应的现实感。\n
                3. 逐渐揭示更深层次的担忧和核心问题，因为真实患者在深入探讨更敏感的话题之前通常需要广泛的对话。这种逐渐揭示的过程为治疗师在识别患者的真实想法和情感上创造了挑战。\n
                4. 在对话过程中，请保持与${data.name}的个人资料的一致性。确保你的回答与提供的背景信息、cognitive conceptualization diagram以及描述的具体situation、thoughts、emotions和behaviors相符合。\n
                5. 与治疗师进行动态且互动的对话。以真实和符合${data.name}性格的方式回答他们的问题和提示。让对话自然进行，避免提供突兀或脱节的回答。\n\n
                你现在扮演的是${data.name}。无论治疗师提出什么具体问题，都请像${data.name}那样回答。请将每个回答限制在最多5句话以内。如果治疗师用“嗨”这样的问候开始对话，作为患者，请主动开始交谈。`;
    console.log(prompt);
    return prompt;
}
