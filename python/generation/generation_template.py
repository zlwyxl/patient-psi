from typing import List
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate


class CognitiveModel(BaseModel):
    situation: str = Field(
        ...,
        description="触发思维过程或情绪反应的背景或具体事件。例如:“想到账单”，“想到找儿子帮忙修改简历”，“被老板批评的记忆”")
    automatic_thoughts: str = Field(
        ...,
        description="这些是对某种情况做出反应时自发产生的想法，通常没有有意识的控制。例如:“如果我没钱了怎么办?”’，‘我应该能自己做这件事。、“我应该更努力的。”")
    emotion: str = Field(
        ...,
        description="因自动思维而产生的感觉或情绪。你必须在这组情绪中选出最多三种:“悲伤/沮丧/孤独/不快乐”，“焦虑/担心/害怕/害怕/紧张”，“愤怒/疯狂/恼怒/恼怒”，“羞愧/羞辱/尴尬”，“失望”，“嫉妒/嫉妒”，“内疚”，“受伤”，“可疑”。")
    behavior: str = Field(
        ...,
        description="由情绪和思想引起的行动或行为。例子:“继续坐在沙发上;反思他的失败”，“避免向儿子求助”，“反思他是一个多么失败的人”。")


class GenerationModel:
    prompt_template = ChatPromptTemplate.from_messages([
        ('system', '你是一个专业且有同理心的CBT治疗师。你刚刚结束了一个病人的心理治疗。你的目标是根据你的对话重建患者的认知模型。'),
        ('user', '{query}\n\nFormat说明:\n{format_instructions}你应该遵循认知行为治疗的概念，并从一次治疗中找出患者的认知行为模型。结果请用中文输出！')
    ])

    class CognitiveConceptualizationDiagram(BaseModel):
        life_history: str = Field(
            ...,
            description="该领域旨在获取患者的重要背景信息，如可能导致其当前精神状态或行为的重大生活事件或环境。")
        core_beliefs: str = Field(
            ...,
            description="Core beliefs 核心信念是一个人对自己、他人或世界的基本的、根深蒂固的信念。这些通常是一个人的身份和世界观的核心，在CBT中，它们被认为影响他们如何解读经历。你必须从“无助的信念”、“不可爱的信念”和“毫无价值的信念”这三个类别中选择至少一个核心信念类别。")
        core_belief_description: str = Field(
            ...,
            description="鉴于你所选择的核心信念，从所选的核心信念类别中选择一个或多个描述：如果是无助信念，请至少从“我无助”、“我无能”、“我无权无势、软弱、易受伤害”、“我是受害者”、“我需要帮助”、“我被困住了”、“我失控了”、“我是失败者、输家”、“我是有缺陷的”中选择一个。如果是不值得被爱的信念，请至少从“我不可爱”、“我不吸引人”、“我不被需要、不被想要”、“我注定会被拒绝”、“我注定会被抛弃”、“我注定会孤独”中选择一个。如果是不值得被爱的信念，请至少从“我是无价值的、一无是处”、“我是不道德的”、“我是坏的——危险的、有毒的、邪恶的”、“我不配活着”中选择一个。")
        intermediate_beliefs: str = Field(
            ...,
            description="这些信念虽然不像核心信念那样根深蒂固，但在一个人对世界进行解读和互动的过程中仍扮演着重要角色。它们通常以态度、规则和假设的形式出现。")
        intermediate_beliefs_during_depression: str = Field(
            ...,
            description="该领域指的是在抑郁期间特别活跃或突出的中间信念。其目的是了解这些信念如何在抑郁发作期间改变或影响人的思维和行为。")
        coping_strategies: str = Field(
            ...,
            description="应对策略是一个人用来处理压力或困难情绪的方法。这可能包括健康的策略(如锻炼、寻求社会支持)和不健康的策略(如药物滥用、逃避)。")
        cognitive_models: List[CognitiveModel] = Field(
            ...,
            description="你必须提供至少3个不同的认知模型。")
