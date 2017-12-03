const ejs = require('ejs');
const heredoc = require('heredoc');

let tpl = heredoc(function(){/*
  <xml>
      <ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
      <FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
      <CreateTime><% createTime %></CreateTime>
      <MsgType><![CDATA[<%= msgType %>]]></MsgType>
      <% if (msgType === 'text') { %>
        <Content><![CDATA[<%= content %>]]></Content>
      <% } else if(msgType === 'image'){ %>
        <Image>
          <MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
        </Image>
      <% } else if(msgType === 'voice'){ %>
        <Voice>
          <MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
        </Voice>
      <% } else if(msgType === 'video'){ %>
        <Video>
          <MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
          <Title><![CDATA[<%= content.title %>]]></Title>
          <Description><![CDATA[<%= content.description %>]]></Description>
        </Video>
      <% } else if(msgType === 'music'){ %>
        <Music>
          <Title><![CDATA[<%= content.title %>]]></Title>
          <Description><![CDATA[<%= content.description %>]]></Description>
          <MusicUrl><![CDATA[<%= content.music_url %>]]></MusicUrl>
          <HQMusicUrl><![CDATA[<%= content.hq_music_url %>]]></HQMusicUrl>
          <ThumbMediaId><![CDATA[<%= content.media_id %>]]></ThumbMediaId>
        </Music>
      <% } else if(msgType === 'news'){ %>
        <ArticleCount><%= content.length %></ArticleCount>
        <Articles>
          <% content.forEach(function(item){ %>
            <item>
              <Title><![CDATA[<%= item.title %>]]></Title>
              <Description><![CDATA[<%= item.description %>]]></Description>
              <PicUrl><![CDATA[<%= item.picurl %>]]></PicUrl>
              <Url><![CDATA[<%= item.url %>]]></Url>
            </item>
          <% }) %>
        </Articles>
      <% } %>
  </xml>
*/});

let compile = ejs.compile(tpl);

module.exports = {
  compile: compile
};