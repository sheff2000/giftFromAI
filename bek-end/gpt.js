import axios from 'axios';
import { gptConfig } from '../config.js';

export const getRating = async ({title, content}) => {
    const requestData = {
        model: "gpt-3.5-turbo-0613",
        messages: [
            {
                role: "system",
                content: `Тебе предоставляется для рассмотрения новости с разных стран мира. Твоя задача оценить позитивность/неготивность этой новости.
                          Оценка производится по шкале от 0 до 10. 
                          Где 0 - это сама ужасная/отрицательная/неготивная новость, 
                          а 10 - максимально позитивная/добрая/радостная и тд новость.
                          5 - нейтральная новость.`
            },
            {
                role: "user",
                content: `Вот новость (может быть на различном языке - русском, английском, французком и тд)
                         Вот заголовок новости:
                        ${title} 
                        Вот контент новости (краткое описание):
                        ${content} 
                        В качестве ответа должен быть ответ в виде цифры (и только цифра, целое число!).`
            }
        ]
    };

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${gptConfig.api_key}`
            }
        });
        
        const assistantMessage = response.data.choices[0].message.content;
        const parsedResponse = parseFloat(assistantMessage.trim());  // Убедитесь, что ответ является числом

        if (isNaN(parsedResponse) || parsedResponse < 0 || parsedResponse > 10) {
            throw new Error('Invalid rating value from assistant');
        }

        return parsedResponse;
    } catch (error) {
        console.error('Ошибка:', error.response?.data || error.message);
        throw new Error('Ошибка при обработке запроса');
    }
}
