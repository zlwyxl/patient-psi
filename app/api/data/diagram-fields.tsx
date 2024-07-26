export const diagramDescriptionMapping: { [key: string]: string } = {
    'relatedHistory': '请记录客户的重要背景信息，例如可能影响他们目前精神状态或行为的重要生活事件或环境。',
    'coreBelief': '请根据你对客户的理解，在无能、不可爱、和无价值这三个核心信念类别中选择任何符合的核心信念。',
    'intermediateBelief': '请确定影响客户对自己、他人和周围世界看法的中间信念。',
    'intermediateBeliefDepression': '如果适用，请确定客户在抑郁发作期间中间信念如何变得更加消极。',
    'copingStrategies': '请阐述客户在处理情绪时所采取的应对方法。',
    'situation': '请记下客户最近遇到的具体情境或触发因素，这引发了消极的自动思维和情绪困扰。',
    'autoThought': '请记下客户对已确定情境的即时、未加掩饰的思考。',
    'emotion': '请选择客户在当前情境中体验到的任何情绪，以及他们自动产生的想法。',
    'behavior': '请描述客户在给定情境中，受自动思维和情绪影响而表现出的行为反应。',
};

export const diagramTitleMapping: { [key: string]: string } = {
    'relatedHistory': '相关的历史',
    'coreBelief': '核心信念',
    'intermediateBelief': '中间信念',
    'intermediateBeliefDepression': '抑郁症期间的中间信念',
    'copingStrategies': '应对策略',
    'situation': '情境',
    'autoThought': '无意识的思想',
    'emotion': '情感',
    'behavior': '行为',
}

export const diagramRelated: string[] = ['coreBelief', 'intermediateBelief', 'copingStrategies']

export const diagramCCD: string[] = ['situation', 'autoThought', 'emotion', 'behavior']
