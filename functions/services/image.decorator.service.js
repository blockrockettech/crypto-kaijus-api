const _ = require('lodash');
const axios = require('axios');
const cheerio = require('cheerio');

const bandanaStyles = `
      <defs>
        <style>
          .cls-1, .cls-11, .cls-2 {
            fill: none;
          }
    
          .cls-1 {
            stroke: #000;
            stroke-width: 3px;
          }
    
          .cls-1, .cls-11 {
            stroke-miterlimit: 10;
          }
    
          .cls-3 {
            fill: #f55b5b;
          }
    
          .cls-4 {
            fill: #fb7875;
          }
    
          .cls-5 {
            clip-path: url(#clip-path);
          }
    
          .cls-6 {
            clip-path: url(#clip-path-2);
          }
    
          .cls-7 {
            clip-path: url(#clip-path-3);
          }
    
          .cls-8 {
            clip-path: url(#clip-path-4);
          }
    
          .cls-9 {
            clip-path: url(#clip-path-5);
          }
    
          .cls-10 {
            fill: url(#New_Pattern_4);
          }
    
          .cls-11 {
            stroke: #fcf0e0;
            stroke-width: 9px;
          }
    
          .cls-12 {
            fill: #d95151;
          }
        </style>
        <clipPath id="clip-path">
          <polygon class="cls-2" points="0 30.05 5.115 30.05 5.115 22.394 0 22.394 0 30.05"/>
        </clipPath>
        <clipPath id="clip-path-2">
          <rect class="cls-2" x="24.3593" y="21.4719" width="5.6907" height="8.5782"/>
        </clipPath>
        <clipPath id="clip-path-3">
          <rect class="cls-2" x="22.6452" y="0.0001" width="7.4048" height="11.319"/>
        </clipPath>
        <clipPath id="clip-path-4">
          <polygon class="cls-2" points="0 0 8.144 0 8.144 10.651 0 10.651 0 0"/>
        </clipPath>
        <clipPath id="clip-path-5">
          <path class="cls-1" d="M228.3539,16.4719l-.382-.764a3.5844,3.5844,0,0,0-5.5752-1.0848C126.4108,99.2205,29.0707,40.021,7.3439,24.7986a3.7157,3.7157,0,0,0-5.7485,2.2157h0a3.7165,3.7165,0,0,0,.0879,1.9893C4.7562,38.4551,31.02,112.2574,112.181,147.3605a5.9373,5.9373,0,0,0,5.29-.31c15.983-9.1,100.4983-60.1764,111.2252-128.4133A3.6,3.6,0,0,0,228.3539,16.4719Z"/>
        </clipPath>
        <pattern id="New_Pattern_4" data-name="New Pattern 4" width="30.05" height="30.05" patternTransform="translate(0 11.3003)" patternUnits="userSpaceOnUse" viewBox="0 0 30.05 30.05">
          <rect class="cls-2" width="30.05" height="30.05"/>
          <rect class="cls-3" y="0.0001" width="30.05" height="30.05"/>
          <path class="cls-4" d="M9.53,20.5265a5.2576,5.2576,0,0,0,2.0952-.4349l-.7379-.4612.8037-.0527-.1186-.83.6984.4744.3953-.7248.0791.83a2.5532,2.5532,0,0,0,.83-1.634l-1.0937.5139.4744-.8433-.9092-.4085.9224-.3821-.448-.8565,1.041.54v-.7116h0V14.9l-1.1069.5271.4744-.8433-.9093-.4085.9224-.3821-.448-.8565,1.0542.54V12.4227l-1.4231.1844.8565-.7906-.87-.8038,1.1859-.1054-.1845-1.1595,1.0278,1.0541a2.7154,2.7154,0,0,1,.5139-.5139L13.2593,9.023l1.5417.1845.0659-1.5812,1.12,1.12,1.041-1.16-.1845,1.8184a3.0609,3.0609,0,0,1,.6061-.0395,4.1313,4.1313,0,0,1,3.2152,1.4231c-.1845,0-.3426.0264-.5139.04l-.1976,1.0936-.5667-.9619c-.0658.0132-.1317.04-.1976.0527l.0659,1.12-.8038-.8565a1.8288,1.8288,0,0,0-.1713.079l.3162,1.0015-.9223-.58a1.436,1.436,0,0,0-.54,1.0673,1.2385,1.2385,0,0,0,.3031.7906l.7906-.448-.3294.8961a1.4555,1.4555,0,0,0,.1844.1186l.7775-.7643-.1054,1.0937a2.18,2.18,0,0,1,.2108.079l.58-.9223.1449,1.1068c.1318.0132.2636.0527.3953.0659a4.0954,4.0954,0,0,1-1.6075.7379v1.265h1.5548l-.2108.3294.3162.1713.1186.0791-.1317.079-.3031.1845.2108.3294H18.4774a2.3991,2.3991,0,0,1-.7907,1.8053V22.24l-.3294-.2108-.2635.4348-.2636-.4348-.3294.2108V20.4606a1.8717,1.8717,0,0,1-.4743.0527h-.1186V22.24l-.3295-.2108-.2635.4348-.2635-.4348-.3295.2108V20.7241a5.0045,5.0045,0,0,1-2.5036.6457,4.879,4.879,0,0,1-2.833-.8565A.1182.1182,0,0,1,9.53,20.5265Z"/>
          <g class="cls-5">
            <g>
              <polygon class="cls-4" points="-4.442 30.105 -3.398 30.722 -0.038 32.708 -0.038 32.708 4.367 30.105 -0.038 22.796 -0.038 22.796 -0.038 22.796 -0.038 22.796 -0.038 22.796 -4.442 30.105 -4.442 30.105 -4.442 30.105"/>
              <polygon class="cls-4" points="-0.038 33.542 -0.038 33.542 -4.442 30.94 -0.038 37.147 -0.038 37.147 4.37 30.94 -0.038 33.542"/>
            </g>
          </g>
          <g class="cls-6">
            <g>
              <polygon class="cls-4" points="25.608 30.105 26.652 30.722 30.012 32.708 30.012 32.708 34.417 30.105 30.012 22.796 30.012 22.796 30.012 22.796 30.012 22.796 30.012 22.796 25.608 30.105 25.608 30.105 25.608 30.105"/>
              <polygon class="cls-4" points="30.012 33.542 30.012 33.542 25.608 30.94 30.012 37.147 30.012 37.147 34.42 30.94 30.012 33.542"/>
            </g>
          </g>
          <g class="cls-7">
            <g>
              <polygon class="cls-4" points="25.608 0.055 26.652 0.672 30.012 2.658 30.012 2.658 34.417 0.055 30.012 -7.254 30.012 -7.254 30.012 -7.254 30.012 -7.254 30.012 -7.254 25.608 0.055 25.608 0.055 25.608 0.055"/>
              <polygon class="cls-4" points="30.012 3.492 30.012 3.492 25.608 0.89 30.012 7.097 30.012 7.097 34.42 0.89 30.012 3.492"/>
            </g>
          </g>
          <g class="cls-8">
            <g>
              <polygon class="cls-4" points="-4.442 0.055 -3.398 0.672 -0.038 2.658 -0.038 2.658 4.367 0.055 -0.038 -7.254 -0.038 -7.254 -0.038 -7.254 -0.038 -7.254 -0.038 -7.254 -4.442 0.055 -4.442 0.055 -4.442 0.055"/>
              <polygon class="cls-4" points="-0.038 3.492 -0.038 3.492 -4.442 0.89 -0.038 7.097 -0.038 7.097 4.37 0.89 -0.038 3.492"/>
            </g>
          </g>
        </pattern>
      </defs>
    `;

const bandanaShape = `
    <g data-name="Layer 1" id="Layer_1" transform="translate(1015, 1350) scale(3.7)">
        <g>
            <g class="cls-9">
                <path class="cls-10" d="M228.3539,16.4719l-.382-.764a3.5844,3.5844,0,0,0-5.5752-1.0848C126.4108,99.2205,29.0707,40.021,7.3439,24.7986a3.7157,3.7157,0,0,0-5.7485,2.2157h0a3.7165,3.7165,0,0,0,.0879,1.9893C4.79,38.5586,31.5977,113.882,114.868,148.5c0,0,101.9737-54.452,113.8283-129.8628A3.6,3.6,0,0,0,228.3539,16.4719Z"/>
                <path class="cls-11" d="M219.368,14S194.0254,86.054,115.6447,131.0558a1.6359,1.6359,0,0,1-1.5692.03C42.868,93.5,16.868,27.5,16.868,27.5"/>
                <path class="cls-12" d="M48.868,60.5c10.8759,3.002,21.5893,5.7018,32.3557,7.8441A224.8366,224.8366,0,0,0,113.52,72.58c1.3454.11,2.6882.11,4.0324.1546,1.3448.0468,2.6888.0744,4.0284.0352,1.34-.0193,2.6867.0234,4.0229-.0443,1.3367-.0642,2.6724-.1464,4.0132-.1867a125.49,125.49,0,0,0,15.9016-2.0813,104.9822,104.9822,0,0,0,15.4756-4.6081A119.1988,119.1988,0,0,0,175.868,58.5a60.8868,60.8868,0,0,1-12.8365,11.2746,74.43,74.43,0,0,1-15.643,7.5074A90.2323,90.2323,0,0,1,130.3919,81.04a107.5143,107.5143,0,0,1-17.3237.5259,130.8323,130.8323,0,0,1-33.64-6.4015,137.5465,137.5465,0,0,1-15.8144-6.2775A99.1033,99.1033,0,0,1,48.868,60.5Z"/>
            </g>
            <path class="cls-1" d="M228.3539,16.4719l-.382-.764a3.5844,3.5844,0,0,0-5.5752-1.0848C126.4108,99.2205,29.0707,40.021,7.3439,24.7986a3.7157,3.7157,0,0,0-5.7485,2.2157h0a3.7165,3.7165,0,0,0,.0879,1.9893C4.7562,38.4551,31.02,112.2574,112.181,147.3605a5.9373,5.9373,0,0,0,5.29-.31c15.983-9.1,100.4983-60.1764,111.2252-128.4133A3.6,3.6,0,0,0,228.3539,16.4719Z"/>
        </g>
    </g>
    `;

class ImageDecoratorService {

    async overlayBandana(rawSvgUrl) {
        console.log(`Overlaying kitty bandana [${rawSvgUrl}]`);

        const rawData = await axios.get(rawSvgUrl);

        const $ = cheerio.load(rawData.data, {xmlMode: true});

        $(`svg`).append(bandanaShape);
        $(`svg`).prepend(bandanaStyles);

        return $.xml();
    }
}

module.exports = new ImageDecoratorService();