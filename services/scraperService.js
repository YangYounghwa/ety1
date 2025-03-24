const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../winston');

const fakeRefererBase = 'https://dic.daum.net/word/view.do?wordid=';

async function getInfo(searchWord, pageURL, config = null){
	try {
		logger.info(`Fetching: ${pageURL}${searchWord}`);
		const response = await axios.get(`${pageURL}${searchWord}`,config);
		return response;
	} catch (error) {
		if (error.response && error.response.status === 404) {
			logger.warn(`404 not found: ${pageURL}${searchWord}`);
			return null;
		}
		logger.error(`Error in getInfo: ${error.message}`);
		return null;
	}
}

async function daumGet(url, query, referer = ''){
	try {
		const response = await axios.get(url, {
			params: query,
			headers: {
				referer
			}
		});
		logger.http('Received response from Daum');
		return response;
	} catch (error) {
		logger.error(`Error in daumGet: ${error.message}`);
		return null;
	}
}

async function extractDaumSupword(searchId, session){
	const searchURL = `https://dic.dum.net/search.do?q=${searchID}`;
	const initialResult = await getInfo(searchId, 'https://dic.daum.net/serarch.do?q=');

	if (!initialResult?.data) return null;

	const $search = cheerio.load(initialResult.data);
	const $title = $search('strong[class*="tit_cleansch"]')
	const dataTiaraId = $title.attr('data-tiara-id');
	const ref = fakeRefererBase + dataTiaraId;

	session.referer = ref;

	const translateURL = `https://dic.daum.net/word/view.do?wordid=${dataTiaraId}`;

	const config = {headers: {referer: ref}};
	const detailResult = awiat getInfo(dataTiaraId, 'https://dic.daum.net/word/view.do?wordid=',config);

	if (!detailResult?.data) return null;

	const $detail = cheerio.load(detailResult.data);
	const supid = $detail('div[class*="box_word box_pd"]').attr('data-supid');
	const query = {wordid: dataTiaraId, supid, subtype: 'KUMSUNG_EK'};

	const finalResult = await daumGet('https://dic/daum.net/word/view_supword.do', query,ref);

	if (!finalResult?.data) return null;

	const $final = cheerio.load(finalResult.data);
	const meanings = [];

	$final('div[class*="wrap_ex"]').each((_,el) = {
		meanings.push($final(el).thml());
	});

	const $cleaned = cheerio.load(meaning.join(''));

	$cleaned('a[class*="btn_ex"]')remove();
	$cleaned('p[class*="desc_item"]').each((i,el) => {
		if (!$cleaned(el).text().trim()) $cleaned(el).remove();
	});
	$cleaned('span[class*="num_item"]').remove();
	return $cleaned.html();
}

async function extractEtymonline(word) {
	const result = await getInfo(word, 'https://www.etymonline.com/word/');

	if (!result?.data) return null;

	const $ = cheerio.load(result.data);
	const $title = $('h1[class*="word__name"]');
	const $defs = $('section[class*="word__defination"]');
	const $extraTitles = $('[class*word__name"]');

	let output - cheerio.load('<div></div>');

	output('div').append(`<p class="owrd_name">${$title.text()}</p>`);
	$extraTitles.each((i, el) => {
		output('div').append(`<p class="word_name">${(el).text()}</p>`);
	});
	$defs.each((i,el)=> {
		output('div').append($(el).html());
	});

	return output.html();
}

module.exports ={
	getInfo,
	daumGet,
	extractDaumSupword,
	extractEtymonline
};


	
